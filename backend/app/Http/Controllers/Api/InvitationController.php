<?php

namespace App\Http\Controllers\Api;

use App\Enums\WorkspaceRole;
use App\Http\Controllers\Controller;
use App\Mail\WorkspaceInvitationMail;
use App\Models\Invitation;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function index(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize('view', $workspace);

        $members = $workspace
            ->users()
            ->select([
                'users.id',
                'users.name',
                'users.email',
            ])
            ->withPivot('role')
            ->orderBy('users.name')
            ->get();

        $invitations = $workspace
            ->invitations()
            ->with('inviter:id,name,email')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json([
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'owner_id' => $workspace->owner_id,
            ],
            'current_user_role' =>
                $workspace->roleFor($request->user()),
            'members' => $members,
            'invitations' => $invitations,
        ]);
    }

    public function store(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize(
            'inviteMembers',
            $workspace
        );

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'role' => [
                'nullable',
                Rule::in([
                    WorkspaceRole::Admin->value,
                    WorkspaceRole::Member->value,
                ]),
            ],
        ]);

        $email = Str::lower(
            trim($validated['email'])
        );

        $alreadyMember = $workspace
            ->users()
            ->where('users.email', $email)
            ->exists();

        if ($alreadyMember) {
            throw ValidationException::withMessages([
                'email' => [
                    'This user is already a workspace member.',
                ],
            ]);
        }

        $pendingInvitation = $workspace
            ->invitations()
            ->where('email', $email)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->exists();

        if ($pendingInvitation) {
            throw ValidationException::withMessages([
                'email' => [
                    'A pending invitation already exists for this email.',
                ],
            ]);
        }

        $rawToken = Str::random(64);

        $invitation = $workspace
            ->invitations()
            ->create([
                'invited_by' =>
                    $request->user()->id,
                'email' => $email,
                'role' => $validated['role']
                    ?? WorkspaceRole::Member->value,
                'token' => hash(
                    'sha256',
                    $rawToken
                ),
                'status' => 'pending',
                'expires_at' => now()->addDays(7),
            ]);

        $invitation->load([
            'workspace',
            'inviter',
        ]);

        Mail::to($email)->send(
            new WorkspaceInvitationMail(
                $invitation,
                $rawToken
            )
        );

        return response()->json([
            'message' =>
                'Invitation sent successfully.',
            'invitation' => $invitation,
        ], 201);
    }

    public function accept(
        Request $request,
        string $token
    ): JsonResponse {
        $hashedToken = hash('sha256', $token);

        $invitation = Invitation::with('workspace')
            ->where('token', $hashedToken)
            ->where('status', 'pending')
            ->first();

        if (! $invitation) {
            return response()->json([
                'message' =>
                    'Invitation not found or already used.',
            ], 404);
        }

        if ($invitation->expires_at->isPast()) {
            return response()->json([
                'message' =>
                    'This invitation has expired.',
            ], 410);
        }

        $user = $request->user();

        if (
            Str::lower($user->email)
            !== Str::lower($invitation->email)
        ) {
            return response()->json([
                'message' =>
                    'This invitation was sent to another email address.',
            ], 403);
        }

        DB::transaction(function () use (
            $invitation,
            $user
        ) {
            $invitation
                ->workspace
                ->users()
                ->syncWithoutDetaching([
                    $user->id => [
                        'role' =>
                            $invitation->role,
                    ],
                ]);

            $invitation->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);
        });

        return response()->json([
            'message' =>
                'Invitation accepted successfully.',
            'workspace' => $invitation->workspace,
        ]);
    }

    public function destroy(
        Request $request,
        Workspace $workspace,
        Invitation $invitation
    ): JsonResponse {
        $this->authorize(
            'inviteMembers',
            $workspace
        );

        abort_unless(
            $invitation->workspace_id
                === $workspace->id,
            404,
            'Invitation not found.'
        );

        if ($invitation->status !== 'pending') {
            return response()->json([
                'message' =>
                    'Only pending invitations can be cancelled.',
            ], 422);
        }

        $invitation->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' =>
                'Invitation cancelled successfully.',
        ]);
    }

    public function updateMemberRole(
        Request $request,
        Workspace $workspace,
        User $member
    ): JsonResponse {
        $this->authorize(
            'manageRoles',
            $workspace
        );

        $validated = $request->validate([
            'role' => [
                'required',
                Rule::in([
                    WorkspaceRole::Admin->value,
                    WorkspaceRole::Member->value,
                ]),
            ],
        ]);

        abort_unless(
            $workspace->hasMember($member),
            404,
            'Workspace member not found.'
        );

        if ($member->id === $workspace->owner_id) {
            return response()->json([
                'message' =>
                    'The owner role cannot be changed.',
            ], 422);
        }

        $workspace
            ->users()
            ->updateExistingPivot(
                $member->id,
                [
                    'role' => $validated['role'],
                ]
            );

        return response()->json([
            'message' =>
                'Member role updated successfully.',
        ]);
    }

    public function removeMember(
        Request $request,
        Workspace $workspace,
        User $member
    ): JsonResponse {
        $this->authorize(
            'removeMembers',
            $workspace
        );

        abort_unless(
            $workspace->hasMember($member),
            404,
            'Workspace member not found.'
        );

        if ($member->id === $workspace->owner_id) {
            return response()->json([
                'message' =>
                    'The workspace owner cannot be removed.',
            ], 422);
        }

        $currentRole = $workspace->roleFor(
            $request->user()
        );

        $targetRole = $workspace->roleFor($member);

        if (
            $currentRole
                === WorkspaceRole::Admin->value
            && $targetRole
                === WorkspaceRole::Admin->value
        ) {
            return response()->json([
                'message' =>
                    'An admin cannot remove another admin.',
            ], 403);
        }

        $workspace->users()->detach($member->id);

        return response()->json([
            'message' =>
                'Member removed successfully.',
        ]);
    }
}