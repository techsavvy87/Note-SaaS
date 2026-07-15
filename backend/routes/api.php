<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvitationController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Team Notes SaaS API is running.',
    ]);
});

Route::get('/plans', [
    PlanController::class,
    'index',
]);

Route::post('/register', [
    AuthController::class,
    'register',
]);

Route::post('/login', [
    AuthController::class,
    'login',
]);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [
        AuthController::class,
        'me',
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);

    Route::get('/workspaces', [
        WorkspaceController::class,
        'index',
    ]);

    Route::post('/workspaces', [
        WorkspaceController::class,
        'store',
    ]);

    Route::get('/workspaces/{workspace}', [
        WorkspaceController::class,
        'show',
    ]);

    Route::put('/workspaces/{workspace}', [
        WorkspaceController::class,
        'update',
    ]);

    Route::delete('/workspaces/{workspace}', [
        WorkspaceController::class,
        'destroy',
    ]);

    Route::scopeBindings()->group(function () {
        Route::get(
            '/workspaces/{workspace}/notes',
            [NoteController::class, 'index']
        );

        Route::post(
            '/workspaces/{workspace}/notes',
            [NoteController::class, 'store']
        );

        Route::get(
            '/workspaces/{workspace}/notes/{note}',
            [NoteController::class, 'show']
        );

        Route::put(
            '/workspaces/{workspace}/notes/{note}',
            [NoteController::class, 'update']
        );

        Route::delete(
            '/workspaces/{workspace}/notes/{note}',
            [NoteController::class, 'destroy']
        );
    });

    Route::get(
        '/workspaces/{workspace}/members',
        [InvitationController::class, 'index']
    );

    Route::post(
        '/workspaces/{workspace}/invitations',
        [InvitationController::class, 'store']
    );

    Route::delete(
        '/workspaces/{workspace}/invitations/{invitation}',
        [InvitationController::class, 'destroy']
    );

    Route::post(
        '/invitations/{token}/accept',
        [InvitationController::class, 'accept']
    );

    Route::patch(
        '/workspaces/{workspace}/members/{member}/role',
        [
            InvitationController::class,
            'updateMemberRole',
        ]
    );

    Route::delete(
        '/workspaces/{workspace}/members/{member}',
        [
            InvitationController::class,
            'removeMember',
        ]
    );
});