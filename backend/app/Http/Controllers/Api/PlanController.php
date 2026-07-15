<?php

namespace App\Http\Controllers\Api;

use App\Enums\WorkspacePlan;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'plans' => [
                [
                    'name' =>
                        WorkspacePlan::Free->value,
                    'display_name' =>
                        WorkspacePlan::Free
                            ->displayName(),
                    'monthly_price' =>
                        WorkspacePlan::Free
                            ->monthlyPrice(),
                    'note_limit' =>
                        WorkspacePlan::Free
                            ->noteLimit(),
                    'features' => [
                        'Up to 5 notes',
                        'Workspace members',
                        'Team invitations',
                        'Roles and permissions',
                    ],
                ],
                [
                    'name' =>
                        WorkspacePlan::Pro->value,
                    'display_name' =>
                        WorkspacePlan::Pro
                            ->displayName(),
                    'monthly_price' =>
                        WorkspacePlan::Pro
                            ->monthlyPrice(),
                    'note_limit' =>
                        WorkspacePlan::Pro
                            ->noteLimit(),
                    'features' => [
                        'Unlimited notes',
                        'Workspace members',
                        'Team invitations',
                        'Roles and permissions',
                    ],
                ],
            ],
        ]);
    }
}