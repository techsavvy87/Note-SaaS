import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import api from "../api/axios";

export default function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const isLoggedIn = Boolean(
    localStorage.getItem("token")
  );

  const acceptInvitation = async () => {
    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        `/invitations/${token}/accept`
      );

      const workspace =
        response.data.workspace;

      localStorage.setItem(
        "activeWorkspaceId",
        String(workspace.id)
      );

      localStorage.setItem(
        "activeWorkspaceName",
        workspace.name
      );

      navigate(
        `/workspaces/${workspace.id}/notes`
      );
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? "Could not accept invitation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page narrow"><section className="card auth-card invitation"><div className="auth-icon">✉</div><p className="eyebrow">You’re invited</p><h2>Join the workspace</h2><p className="intro">Accept this invitation to start sharing notes and ideas with your team.</p>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      {!isLoggedIn ? (
        <>
          <p className="intro">
            Please log in using the invited
            email address.
          </p>

          <Link className="btn btn-primary btn-block" to="/login">
            Go to Login
          </Link>
        </>
      ) : (
        <button
          className="btn btn-primary btn-block" onClick={acceptInvitation}
          disabled={submitting}
        >
          {submitting
            ? "Accepting..."
            : "Accept Invitation"}
        </button>
      )}</section>
    </main>
  );
}
