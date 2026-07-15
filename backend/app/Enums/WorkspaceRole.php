<?php

namespace App\Enums;

enum WorkspaceRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';

    public static function values(): array
    {
        return array_map(
            fn (self $role) => $role->value,
            self::cases()
        );
    }
}