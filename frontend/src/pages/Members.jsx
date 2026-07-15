import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import api from "../api/axios";

export default function Members() {
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const fetchMembers = async () => {
    try {
      const response = await api.get(
        `/workspaces/${workspaceId}/members`
      );

      setWorkspace(response.data.workspace);
      setMembers(response.data.members);
      setInvitations(response.data.invitations);
      setCurrentUserRole(response.data.current_user_role);
    } catch (err) {
      setError(
        err.response?.data?.message
        ?? "Could not load workspace members."
      );

      console.error(err);
    }
  };

  const sendInvitation = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        `/workspaces/${workspaceId}/invitations`,
        {
          email: email.trim(),
          role: inviteRole,
        }
      );

      setEmail("");
      setMessage(response.data.message);
      setInviteRole("member");

      await fetchMembers();
    } catch (err) {
      const validationError =
        err.response?.data?.errors?.email?.[0];

      setError(
        validationError
        ?? err.response?.data?.message
        ?? "Could not send invitation."
      );

      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const cancelInvitation = async (
    invitationId
  ) => {
    const confirmed = window.confirm(
      "Cancel this invitation?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await api.delete(
        `/workspaces/${workspaceId}`
        + `/invitations/${invitationId}`
      );

      setMessage(response.data.message);

      await fetchMembers();
    } catch (err) {
      setError(
        err.response?.data?.message
        ?? "Could not cancel invitation."
      );

      console.error(err);
    }
  };

const updateMemberRole = async (
    memberId,
    role
  ) => {
    setError("");
    setMessage("");

    try {
        const response = await api.patch(
        `/workspaces/${workspaceId}`
            + `/members/${memberId}/role`,
        {
            role,
        }
        );

        setMessage(response.data.message);
        await fetchMembers();
    } catch (err) {
        setError(
        err.response?.data?.message
        ?? "Could not update member role."
        );

        console.error(err);
    }
};

const removeMember = async (memberId) => {
  const confirmed = window.confirm(
    "Remove this member from the workspace?"
  );

  if (!confirmed) {
    return;
  }

  setError("");
  setMessage("");

  try {
    const response = await api.delete(
      `/workspaces/${workspaceId}`
        + `/members/${memberId}`
    );

    setMessage(response.data.message);
    await fetchMembers();
  } catch (err) {
    setError(
      err.response?.data?.message
      ?? "Could not remove member."
    );

    console.error(err);
  }
};

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const canInvite = ["owner", "admin"].includes(currentUserRole);
  const canManageRoles = currentUserRole === "owner";
  const canRemoveMembers = ["owner", "admin"].includes(currentUserRole);

  return (
    <main className="page">
      <Link
        to={`/workspaces/${workspaceId}/notes`}
      >
        ← Back to Notes
      </Link>

      <header className="page-head"><div><p className="eyebrow">Team access</p><h1 className="page-title">
        {workspace
          ? `${workspace.name} Members`
          : "Workspace Members"}
      </h1><p className="page-subtitle">Invite teammates and manage workspace permissions.</p></div></header>

      {error && (
        <p className="alert alert-error">
          {error}
        </p>
      )}

      {message && (
        <p className="alert alert-success">
          {message}
        </p>
      )}

      {canInvite && (
        <form onSubmit={sendInvitation} className="card toolbar">
            <input
            type="email"
            placeholder="Member email"
            value={email}
            onChange={(event) =>
                setEmail(event.target.value)
            }
            />

            <select
            value={inviteRole}
            onChange={(event) =>
                setInviteRole(event.target.value)
            }
            >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            </select>

            <button
            type="submit" className="btn btn-primary"
            disabled={submitting}
            >
            {submitting
                ? "Sending..."
                : "Invite Member"}
            </button>
        </form>
        )}

      <h2 className="section-title">Current members <span className="badge">{members.length}</span></h2><div className="members-grid">

      {members.map((member) => {
        const isOwner =
            member.id === workspace?.owner_id;

        const canRemoveThisMember =
            canRemoveMembers && !isOwner;

        return (
            <article
            key={member.id}
            className="card member-card"
            >
            <p>{member.name}</p>
            <p>{member.email}</p>

            {canManageRoles && !isOwner ? (
                <select
                value={member.pivot?.role}
                onChange={(event) =>
                    updateMemberRole(
                    member.id,
                    event.target.value
                    )
                }
                >
                <option value="member">
                    Member
                </option>

                <option value="admin">
                    Admin
                </option>
                </select>
            ) : (
                <p>
                Role: {member.pivot?.role}
                </p>
            )}

            {canRemoveThisMember && (
                <button className="btn btn-danger"
                onClick={() =>
                    removeMember(member.id)
                }
                >
                Remove Member
                </button>
            )}
            </article>
        );
        })}</div>

      <h2 className="section-title">Pending invitations <span className="badge">{invitations.length}</span></h2>

      {invitations.length === 0 ? (
        <div className="empty">No pending invitations.</div>
      ) : (
        invitations.map((invitation) => (
          <article
            key={invitation.id}
            className="card pending-card"
          >
            <p>{invitation.email}</p>
            <p>Role: {invitation.role}</p>
            <p>
              Expires:{" "}
              {new Date(
                invitation.expires_at
              ).toLocaleString()}
            </p>

            <button
              className="btn btn-danger" onClick={() =>
                cancelInvitation(invitation.id)
              }
            >
              Cancel Invitation
            </button>
          </article>
        ))
      )}
    </main>
  );
}
