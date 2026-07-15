<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class NoteController extends Controller
{
    public function index(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize(
            'viewAny',
            [Note::class, $workspace]
        );

        $notes = $workspace
            ->notes()
            ->with('user:id,name,email')
            ->latest()
            ->get();

        return response()->json([
            'current_user' => [
                'id' => $request->user()->id,
                'role' => $workspace->roleFor(
                    $request->user()
                ),
            ],
            'plan' => $workspace->planSummary(),
            'notes' => $notes,
        ]);
    }

    public function store(
        Request $request,
        Workspace $workspace
    ): JsonResponse {
        $this->authorize(
            'create',
            [Note::class, $workspace]
        );

        if (! $workspace->canCreateNote()) {
            throw ValidationException::withMessages([
                'plan' => [
                    'The Free plan allows up to 5 notes per workspace. Upgrade to Pro to create unlimited notes.',
                ],
            ]);
        }

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'content' => [
                'nullable',
                'string',
            ],
        ]);

        $note = $workspace->notes()->create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'content' =>
                $validated['content'] ?? null,
        ]);

        return response()->json([
            'message' => 'Note created successfully.',
            'note' => $note->load(
                'user:id,name,email'
            ),
            'plan' => $workspace
                ->fresh()
                ->planSummary(),
        ], 201);
    }

    public function show(
        Request $request,
        Workspace $workspace,
        Note $note
    ): JsonResponse {
        $this->authorize('view', $note);

        return response()->json([
            'note' => $note->load(
                'user:id,name,email'
            ),
        ]);
    }

    public function update(
        Request $request,
        Workspace $workspace,
        Note $note
    ): JsonResponse {
        $this->authorize('update', $note);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'content' => [
                'nullable',
                'string',
            ],
        ]);

        $note->update([
            'title' => $validated['title'],
            'content' =>
                $validated['content'] ?? null,
        ]);

        return response()->json([
            'message' => 'Note updated successfully.',
            'note' => $note
                ->fresh()
                ->load('user:id,name,email'),
        ]);
    }

    public function destroy(
        Request $request,
        Workspace $workspace,
        Note $note
    ): JsonResponse {
        $this->authorize('delete', $note);

        $note->delete();

        return response()->json([
            'message' => 'Note deleted successfully.',
            'plan' => $workspace
                ->fresh()
                ->planSummary(),
        ]);
    }
}