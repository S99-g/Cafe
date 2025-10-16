import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import "./register.css"; // ⬅️ add this

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg]   = useState("");
  const [err, setErr]   = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      // backend defaults role to "User"
      await api.register({ username, email, password });
      setMsg("Registered! You can now login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (e) {
      setErr(e?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      {/* blurred background image */}
      <div className="auth__bg" aria-hidden="true">
        <img src="/images/background.jpg" alt="" />
      </div>
      <div className="auth__overlay" aria-hidden="true" />

      {/* card */}
      <div className="auth__box">
        <h1 className="auth__title">Register</h1>

        {msg && <div className="auth__ok">{msg}</div>}
        {err && <div className="auth__error">{err}</div>}

        <form className="auth__form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="field__input"
              type="text"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="field__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="field__input"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </label>

          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Registering…" : "Register"}
          </button>
        </form>

        <p className="auth__meta">
          Already have an account?{" "}
          <Link className="link" to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
