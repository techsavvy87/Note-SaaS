import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post(
        "/login",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.errors?.email?.[0]
          ?? err.response?.data?.message
          ?? "Login failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page narrow">
      <section className="card auth-card">
      <div className="auth-icon">↗</div>
      <h2>Welcome back</h2>
      <p className="intro">Sign in to continue to your team workspace.</p>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="field"><label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="field"><label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit" className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting
            ? "Logging in..."
            : "Login"}
        </button>
      </form><p className="auth-foot">New to Notely? <a href="/register">Create an account</a></p></section>
    </main>
  );
}
