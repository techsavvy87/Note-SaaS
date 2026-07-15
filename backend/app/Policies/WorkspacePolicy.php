<?php

namespace App\Policies;

use App\Enums\WorkspaceRole;
use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function view(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->hasMember($user);
    }

    public function update(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->userHasAnyRole($user, [
            WorkspaceRole::Owner,
            WorkspaceRole::Admin,
        ]);
    }

    public function delete(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->userHasRole(
            $user,
            WorkspaceRole::Owner
        );
    }

    public function inviteMembers(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->userHasAnyRole($user, [
            WorkspaceRole::Owner,
            WorkspaceRole::Admin,
        ]);
    }

    public function manageRoles(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->userHasRole(
            $user,
            WorkspaceRole::Owner
        );
    }

    public function removeMembers(
        User $user,
        Workspace $workspace
    ): bool {
        return $workspace->userHasAnyRole($user, [
            WorkspaceRole::Owner,
            WorkspaceRole::Admin,
        ]);
    }
}