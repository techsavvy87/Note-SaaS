<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workspace Invitation</title>
</head>
<body>
    <h2>Workspace Invitation</h2>

    <p>
        You have been invited by
        {{ $invitation->inviter->name }}
        to join:
    </p>

    <h3>
        {{ $invitation->workspace->name }}
    </h3>

    <p>
        Role: {{ ucfirst($invitation->role) }}
    </p>

    <p>
        <a href="{{ config('app.frontend_url') }}/invitations/{{ $rawToken }}">
            Accept Invitation
        </a>
    </p>

    <p>
        This invitation expires on
        {{ $invitation->expires_at->format('M d, Y g:i A') }}.
    </p>

    <p>
        Please log in using {{ $invitation->email }}
        before accepting the invitation.
    </p>
</body>
</html>