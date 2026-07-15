<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('workspace_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('invited_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('email');
            $table->string('role')->default('member');

            // We store a hashed token instead of the raw token.
            $table->string('token')->unique();

            $table->string('status')->default('pending');

            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();

            $table->timestamps();

            $table->index([
                'workspace_id',
                'email',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};