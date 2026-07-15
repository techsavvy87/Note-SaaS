<?php

namespace App\Models;

use App\Enums\WorkspacePlan;
use App\Enums\WorkspaceRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'plan',
        'plan_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'plan' => WorkspacePlan::class,
            'plan_ends_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'owner_id'
        );
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function hasMember(User $user): bool
    {
        return $this->users()
            ->where('users.id', $user->id)
            ->exists();
    }

    public function roleFor(User $user): ?string
    {
        $member = $this->users()
            ->where('users.id', $user->id)
            ->first();

        return $member?->pivot?->role;
    }

    public function userHasRole(
        User $user,
        WorkspaceRole|string $role
    ): bool {
        $roleValue = $role instanceof WorkspaceRole
            ? $role->value
            : $role;

        return $this->roleFor($user) === $roleValue;
    }

    public function userHasAnyRole(
        User $user,
        array $roles
    ): bool {
        $currentRole = $this->roleFor($user);

        $roleValues = array_map(
            fn ($role) => $role instanceof WorkspaceRole
                ? $role->value
                : $role,
            $roles
        );

        return in_array(
            $currentRole,
            $roleValues,
            true
        );
    }

    public function noteLimit(): ?int
    {
        return $this->plan->noteLimit();
    }

    public function canCreateNote(): bool
    {
        $limit = $this->noteLimit();

        if ($limit === null) {
            return true;
        }

        return $this->notes()->count() < $limit;
    }

    public function planSummary(): array
    {
        $limit = $this->noteLimit();
        $used = $this->notes()->count();

        return [
            'name' => $this->plan->value,
            'display_name' => $this->plan->displayName(),
            'monthly_price' => $this->plan->monthlyPrice(),
            'note_limit' => $limit,
            'notes_used' => $used,
            'notes_remaining' => $limit === null
                ? null
                : max(0, $limit - $used),
            'unlimited_notes' => $limit === null,
            'can_create_note' => $limit === null
                || $used < $limit,
            'plan_ends_at' => $this->plan_ends_at,
        ];
    }
}