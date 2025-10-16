import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./login.css"; // reuse auth styles

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  // OTP + inline reset
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk(false);
    setBusy(true);
    try {
      await api.forgotPassword(email);
      setOk(true); // backend hides whether email exists
      setMsg("If that email exists, we sent an OTP and a reset link.");
    } catch (err) {
      setError(err.message || "Failed to request reset link");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!email) {
      setError("Enter your email above first.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit OTP from your email.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.verifyOtp(email, otp);
      setToken(res?.token || "");
      setMsg("OTP verified. You can set a new password now.");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setBusy(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!token) {
      setError("Missing reset token. Verify OTP again or use the link from your email.");
      return;
    }
    if (!pwd || pwd.length < 6) {
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
      setMsg("Password reset successful. Redirecting to login…");
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err) {
      setError(err.message || "Failed to reset password");
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
        <h1 className="auth__title">Forgot Password</h1>

        {error && <div className="auth__error">{error}</div>}
        {(ok || msg) && (
          <div
            className="auth__error"
            style={{ background: "#ecfccb", color: "#166534", borderColor: "#bbf7d0" }}
          >
            {msg || "If that email exists, a reset link has been sent."}
          </div>
        )}

        {/* 1) Request email */}
        <form className="auth__form" onSubmit={submit}>
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

          <button className="btn btn--primary" disabled={busy}>
            {busy ? "Sending…" : "Send reset (OTP + link)"}
          </button>
        </form>

        {/* 2) Verify OTP (optional path) */}
        <form className="auth__form" onSubmit={verifyOtp} style={{ marginTop: 12 }}>
          <label className="field">
            <span className="field__label">OTP (6 digits)</span>
            <input
              className="field__input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </label>

          <button className="btn btn--primary" disabled={busy || !email || otp.length !== 6}>
            {busy ? "Verifying…" : "Verify OTP"}
          </button>
        </form>

        {/* 3) Inline reset after OTP success */}
        {token && (
          <form className="auth__form" onSubmit={doReset} style={{ marginTop: 12 }}>
            <label className="field">
              <span className="field__label">New Password</span>
              <input
                className="field__input"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Confirm New Password</span>
              <input
                className="field__input"
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                minLength={6}
                required
              />
            </label>

            <button className="btn btn--primary" disabled={busy}>
              {busy ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth__meta" style={{ marginTop: 12 }}>
          Remembered your password?{" "}
          <a
            href="/login"
            className="link"
            style={{ color: "#000", textDecoration: "underline", textDecorationColor: "#000", textUnderlineOffset: "2px" }}
          >
            Back to Login
          </a>
        </p>
      </div>
    </main>
  );
}
