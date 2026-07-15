<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invitation $invitation,
        public string $rawToken
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're invited to join "
                . $this->invitation->workspace->name
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workspace-invitation'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}