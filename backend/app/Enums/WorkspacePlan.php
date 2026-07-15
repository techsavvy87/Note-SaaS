<?php

namespace App\Enums;

enum WorkspacePlan: string
{
    case Free = 'free';
    case Pro = 'pro';

    public function displayName(): string
    {
        return match ($this) {
            self::Free => 'Free',
            self::Pro => 'Pro',
        };
    }

    public function monthlyPrice(): int
    {
        return match ($this) {
            self::Free => 0,
            self::Pro => 9,
        };
    }

    public function noteLimit(): ?int
    {
        return match ($this) {
            self::Free => 5,
            self::Pro => null,
        };
    }
}