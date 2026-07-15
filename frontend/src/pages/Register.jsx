import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
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
        "/register",
        form
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      navigate("/dashboard");
    } catch (err) {
      const errors = err.response?.data?.errors;

      setError(
        errors?.email?.[0]
          ?? errors?.password?.[0]
          ?? err.response?.data?.message
          ?? "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page narrow"><section className="card auth-card">
      <div className="auth-icon">✦</div><h2>Create your account</h2><p className="intro">Bring your team’s ideas, notes, and decisions into one calm space.</p>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="form-stack">
        <div className="field"><label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            name="name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="field"><label htmlFor="reg-email">Email address</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="field"><label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            placeholder="Choose a secure password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit" className="btn btn-primary btn-block"
          disabled={submitting}
        >
          {submitting
            ? "Registering..."
            : "Register"}
        </button>
      </form><p className="auth-foot">Already have an account? <a href="/login">Sign in</a></p></section>
    </main>
  );
}
