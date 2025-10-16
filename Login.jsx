import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import "./login.css"; // ⬅️ keep this

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data?.user?.role;
      const from = location.state?.from?.pathname;

      if (from) navigate(from, { replace: true });
      else if (role === "Admin" || role === "SuperAdmin") navigate("/admin", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__bg" aria-hidden="true">
        <img src="/images/background.jpg" alt="" />
      </div>
      <div className="auth__overlay" aria-hidden="true" />

      <div className="auth__box">
        <h1 className="auth__title">Login</h1>

        {error && <div className="auth__error">{error}</div>}

        <form className="auth__form" onSubmit={handleSubmit}>
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
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* Forgot password (anchor version, as requested) */}
        <p className="auth__meta" style={{ marginTop: 10 }}>
          <a
            href="/forgot-password"
            className="link"
            style={{
              color: "#000",
              textDecoration: "underline",
              textDecorationColor: "#000",
              textUnderlineOffset: "2px",
            }}
          >
            Forgot password?
          </a>
        </p>

        <p className="auth__meta">
          No account?{" "}
          <Link
            to="/register"
            className="link"
            style={{
              color: "#000",
              textDecoration: "underline",
              textDecorationColor: "#000",
              textUnderlineOffset: "2px",
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
