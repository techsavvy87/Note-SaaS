import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    try {
      const response = await api.get("/me");
      setUser(response.data.user);
    } catch {
      setError("Please log in.");
      navigate("/login");
    }
  };

  const openActiveWorkspace = () => {
    const workspaceId = localStorage.getItem(
      "activeWorkspaceId"
    );

    if (workspaceId) {
      navigate(
        `/workspaces/${workspaceId}/notes`
      );
      return;
    }

    navigate("/workspaces");
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem(
        "activeWorkspaceId"
      );
      localStorage.removeItem(
        "activeWorkspaceName"
      );

      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <main className="page">
      <header className="page-head"><div><p className="eyebrow">Overview</p><h1 className="page-title">Your dashboard</h1><p className="page-subtitle">Pick up where your team left off.</p></div></header>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      {user && (
        <><section className="card dashboard-card"><div className="avatar">{user.name?.charAt(0).toUpperCase()}</div><div className="user-info"><h3>Welcome back, {user.name}</h3><p>{user.email}</p></div><div className="actions"><button className="btn btn-primary" onClick={openActiveWorkspace}>Open workspace →</button><button className="btn btn-ghost" onClick={logout}>Sign out</button></div></section><div className="quick-grid"><div className="card quick-card"><strong>One place for every idea</strong><span>Keep project knowledge easy to find.</span></div><div className="card quick-card"><strong>Built for your team</strong><span>Invite members and collaborate together.</span></div><div className="card quick-card"><strong>Simple, focused writing</strong><span>Capture decisions without the clutter.</span></div></div></>
      )}
    </main>
  );
}
