import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Workspaces() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] =
    useState([]);

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get(
        "/workspaces"
      );

      setWorkspaces(response.data.workspaces);
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? "Could not load workspaces."
      );
    }
  };

  const openWorkspace = (workspace) => {
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
  };

  const createWorkspace = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Workspace name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        "/workspaces",
        {
          name: name.trim(),
        }
      );

      const workspace =
        response.data.workspace;

      setName("");
      openWorkspace(workspace);
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? "Could not create workspace."
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  return (
    <main className="page"><header className="page-head"><div><p className="eyebrow">Your spaces</p><h1 className="page-title">Workspaces</h1><p className="page-subtitle">Organize notes by team, client, or project.</p></div></header>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      <form onSubmit={createWorkspace} className="card toolbar"><div className="field"><label htmlFor="workspace-name">Create a new workspace</label><input id="workspace-name"
          placeholder="Workspace name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
        /></div>

        <button
          type="submit" className="btn btn-primary"
          disabled={submitting}
        >
          {submitting
            ? "Creating..."
            : "Create Workspace"}
        </button>
      </form>

      <h2 className="section-title">All workspaces <span className="badge">{workspaces.length}</span></h2><div className="grid">{workspaces.map((workspace) => (
        <article
          key={workspace.id}
          className="card workspace-card"
        >
          <div className="card-icon">{workspace.name?.charAt(0).toUpperCase()}</div><h3>{workspace.name}</h3><div className="meta-row"><span className="badge">{workspace.pivot?.role}</span><span className="badge badge-purple">{workspace.plan} plan</span></div>

          <button
            className="btn btn-secondary btn-block" onClick={() =>
              openWorkspace(workspace)
            }
          >
            Open workspace →
          </button>
        </article>
      ))}</div>{workspaces.length === 0 && <div className="empty">No workspaces yet. Create your first one above.</div>}
    </main>
  );
}
