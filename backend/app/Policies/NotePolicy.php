<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\Note;
use App\Models\User;
use App\Models\Workspace;

class NotePolicy
{
    public function viewAny(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->hasMember($user);
    }

    public function create(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->hasMember($user);
    }

    public function view(
        User $user,
        Note $note
    ): bool {
        return $note->workspace->hasMember($user);
    }

    public function update(
        User $user,
        Note $note
    ): bool {
        $workspace = $note->workspace;

        if (
            $workspace->userHasAnyRole($user, [
                WorkspaceRole::Owner,
                WorkspaceRole::Admin,
            ])
        ) {
            return true;
        }

        return $note->user_id === $user->id;
    }

    public function delete(
        User $user,
        Note $note
    ): bool {
        $workspace = $note->workspace;

        if (
            $workspace->userHasAnyRole($user, [
                WorkspaceRole::Owner,
                WorkspaceRole::Admin,
            ])
        ) {
            return true;
        }

        return $note->user_id === $user->id;
    }
}