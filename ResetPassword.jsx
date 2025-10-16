import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./login.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (pwd.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pwd !== pwd2) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await api.resetPassword(token, pwd);
      setOk(true);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err.message || "Reset failed (token may be invalid/expired).");
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
        <h1 className="auth__title">Reset Password</h1>

        {error && <div className="auth__error">{error}</div>}
        {ok && (
          <div
            className="auth__error"
            style={{ background: "#ecfccb", color: "#166534", borderColor: "#bbf7d0" }}
          >
            Password reset successful. Redirecting to login…
          </div>
        )}

        <form className="auth__form" onSubmit={submit}>
          <label className="field">
            <span className="field__label">New Password</span>
            <input
              className="field__input"
              type="password"
              placeholder="New password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span className="field__label">Confirm New Password</span>
            <input
              className="field__input"
              type="password"
              placeholder="Confirm new password"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              minLength={6}
              required
              autoComplete="new-password"
            />
          </label>

          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Resetting…" : "Reset Password"}
          </button>
        </form>
      </div>
    </main>
  );
}
