<?php

namespace App\Http\Controllers\Api;

use App\Enums\WorkspacePlan;
use App\Enums\WorkspaceRole;
use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    public function index(
        Request $request
    ): JsonResponse {
        $workspaces = $request
            ->user()
            ->workspaces()
            ->withPivot('role')
            ->latest('workspaces.created_at')
            ->get();

        return response()->json([
            'workspaces' => $workspaces,
        ]);
    }

    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $user = $request->user();

        $workspace = DB::transaction(
            function () use ($validated, $user) {
                $workspace = Workspace::create([
                    'owner_id' => $user->id,
                    'name' => $validated['name'],
                    'slug' => $this->generateUniqueSlug(
                        $validated['name']
                    ),
                    'plan' => WorkspacePlan::Free,
                ]);

                $workspace->users()->attach(
                    $user->id,
                    [
                        'role' =>
                            WorkspaceRole::Owner->value,
                    ]
                );

                return $workspace;
            }
        );

        return response()->json([
            'message' =>
                'Workspace created successfully.',
            'workspace' => $workspace->load('users'),
        ], 201);
    }

    public function show(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize('view', $workspace);

        return response()->json([
            'workspace' => $workspace->load([
                'owner:id,name,email',
                'users:id,name,email',
            ]),
            'plan' => $workspace->planSummary(),
        ]);
    }

    public function update(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize('update', $workspace);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        $workspace->update([
            'name' => $validated['name'],
        ]);

        return response()->json([
            'message' =>
                'Workspace updated successfully.',
            'workspace' => $workspace,
        ]);
    }

    public function destroy(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize('delete', $workspace);

        $workspace->delete();

        return response()->json([
            'message' =>
                'Workspace deleted successfully.',
        ]);
    }

    private function generateUniqueSlug(
        string $name
    ): string {
        $baseSlug = Str::slug($name);

        if ($baseSlug === '') {
            $baseSlug = 'workspace';
        }

        $slug = $baseSlug;
        $number = 1;

        while (
            Workspace::where('slug', $slug)->exists()
        ) {
            $slug = "{$baseSlug}-{$number}";
            $number++;
        }

        return $slug;
    }
}