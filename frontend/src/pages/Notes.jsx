import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import api from "../api/axios";

export default function Notes() {
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] =
    useState(null);

  const [notes, setNotes] = useState([]);
  const [plan, setPlan] = useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const fetchWorkspace = async () => {
    const response = await api.get(
      `/workspaces/${workspaceId}`
    );

    setWorkspace(response.data.workspace);
  };

  const fetchNotes = async () => {
    const response = await api.get(
      `/workspaces/${workspaceId}/notes`
    );

    setNotes(response.data.notes);
    setPlan(response.data.plan);
    setCurrentUser(response.data.current_user);
  };

  const loadPage = async () => {
    setError("");

    try {
      await Promise.all([
        fetchWorkspace(),
        fetchNotes(),
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? "Could not load notes."
      );
    }
  };

  const createNote = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Note title is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post(
        `/workspaces/${workspaceId}/notes`,
        {
          title: form.title.trim(),
          content:
            form.content.trim() || null,
        }
      );

      setForm({
        title: "",
        content: "",
      });

      await fetchNotes();
    } catch (err) {
      setError(
        err.response?.data?.errors?.plan?.[0]
          ?? err.response?.data?.errors
            ?.title?.[0]
          ?? err.response?.data?.message
          ?? "Could not create note."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNote = async (noteId) => {
    const confirmed = window.confirm(
      "Delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/workspaces/${workspaceId}/notes/${noteId}`
      );

      await fetchNotes();
    } catch (err) {
      setError(
        err.response?.data?.message
          ?? "Could not delete note."
      );
    }
  };

  useEffect(() => {
    loadPage();
  }, [workspaceId]);

  return (
    <main className="page medium">
      <Link to="/workspaces">
        ← Back to Workspaces
      </Link>

      <Link
        to={`/workspaces/${workspaceId}/members`}
        className="btn btn-secondary"
      >
        Manage Members
      </Link>

      <header className="page-head"><div><p className="eyebrow">Shared knowledge</p><h1 className="page-title">
        {workspace
          ? `${workspace.name} Notes`
          : "Workspace Notes"}
      </h1><p className="page-subtitle">Capture ideas, decisions, and useful context for your team.</p></div></header>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      {plan && (
        <section
          className="card plan-card"
        >
          <h3>{plan.display_name} Plan</h3>

          {plan.unlimited_notes ? (
            <p>Unlimited notes</p>
          ) : (
            <>
              <p>
                {plan.notes_used} of{" "}
                {plan.note_limit} notes used
              </p>

              <p>
                {plan.notes_remaining} notes
                remaining
              </p>
            </>
          )}

          {plan.name === "free" && (
            <Link to="/pricing">
              Upgrade to Pro
            </Link>
          )}
        </section>
      )}

      {plan?.can_create_note === false && (
        <p className="alert alert-error">
          You reached the Free plan limit.
        </p>
      )}

      <form onSubmit={createNote} className="card composer form-stack"><h3>Create a note</h3>
        <input
          placeholder="Note title"
          value={form.title}
          disabled={
            plan?.can_create_note === false
          }
          onChange={(event) =>
            setForm({
              ...form,
              title: event.target.value,
            })
          }
        />

        <textarea
          placeholder="Note content"
          value={form.content}
          disabled={
            plan?.can_create_note === false
          }
          onChange={(event) =>
            setForm({
              ...form,
              content: event.target.value,
            })
          }
        />

        <button
          type="submit" className="btn btn-primary btn-block"
          disabled={
            submitting
            || plan?.can_create_note === false
          }
        >
          {submitting
            ? "Creating..."
            : plan?.can_create_note === false
              ? "Note Limit Reached"
              : "Create Note"}
        </button>
      </form>

      <h2 className="section-title">Team notes <span className="badge">{notes.length}</span></h2>

      {notes.map((note) => {
        const canModifyNote =
          ["owner", "admin"].includes(
            currentUser?.role
          )
          || note.user_id === currentUser?.id;

        return (
          <article
            key={note.id}
            className="card note-card"
          >
            <h3>{note.title}</h3>
            <p>{note.content}</p>

            <small>
              Created by:{" "}
              {note.user?.name ?? "Unknown"}
            </small>

            {canModifyNote && (
              <div style={{ marginTop: "10px" }}>
                <button className="btn btn-danger"
                  onClick={() =>
                    deleteNote(note.id)
                  }
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        );
      })}{notes.length === 0 && <div className="empty">No notes yet. Create the first one above.</div>}
    </main>
  );
}
