// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../models");

// ---- optional email --------------------------------------------------------
let nodemailer = null;
try { nodemailer = require("nodemailer"); } catch {}
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const RESET_SECRET = process.env.RESET_SECRET || process.env.JWT_SECRET || "dev-reset-secret";

// Build transporter dynamically so it works for 465 (secure) and 587/25 (starttls)
const makeTransporter = () => {
  if (!nodemailer || !process.env.SMTP_HOST) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // true for 465, false for 587/25
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
    // Dev-only: uncomment if you hit “self signed certificate” locally
    // tls: { rejectUnauthorized: false },
  });
};
const transporter = makeTransporter();
// ---------------------------------------------------------------------------

const ALLOWED_ROLES = ["User", "Admin", "SuperAdmin"];
const signToken = (payload, opts = { expiresIn: "1h" }) =>
  jwt.sign(payload, RESET_SECRET, opts);

// helper to issue a password-reset token (used by link and OTP)
const issueResetToken = (user) =>
  signToken({ uid: user.id, email: user.email, purpose: "pwdreset" }, { expiresIn: "1h" });

// 🔐 simple in-memory OTP store (email -> record)
// record shape: { hash, exp:number(ms), attempts:number, uid:number }
const otpStore = new Map();

/* ---------------------- Joi Schemas ---------------------- */
const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid(...ALLOWED_ROLES).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(1).required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d{6}$/).required(),
});

/* -------------------- REGISTER -------------------- */
exports.register = async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }
    let { username, email, password, role = "User" } = value;
    if (!ALLOWED_ROLES.includes(role)) role = "User";

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role });

    // also return a normal auth token if you use it for login flows
    const authJwt = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      message: "User registered",
      token: authJwt,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
};

/* ---------------------- LOGIN --------------------- */
exports.login = async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });

    const { email, password } = value;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const authJwt = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token: authJwt,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

/* --------- FORGOT PASSWORD (link + OTP email) ------- */
exports.forgotPassword = async (req, res) => {
  const { value, error } = forgotSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });

  const { email } = value;
  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      // 1) token + link (existing behaviour)
      const token = issueResetToken(user);
      const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

      // 2) 6-digit OTP (10-minute expiry)
      const otp = ("" + Math.floor(100000 + Math.random() * 900000)).slice(-6);
      const hash = await bcrypt.hash(otp, 10);
      otpStore.set(email, { hash, exp: Date.now() + 10 * 60 * 1000, attempts: 0, uid: user.id });

      // 3) Send mail
      const subject = "Your password reset OTP";
      const html = `
        <p>Hi ${user.username || ""},</p>
        <p>Use this OTP to reset your password (valid for 10 minutes):</p>
        <p style="font-size:20px;font-weight:700;letter-spacing:3px">${otp}</p>
        <p>Or click the link to reset without OTP (valid for 1 hour):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `;

      if (transporter) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || "no-reply@example.com",
            to: user.email,
            subject,
            html,
          });
        } catch (e) {
          console.error("Email send failed:", e.message);
        }
      } else {
        console.log("🔗 Password reset link:", resetUrl);
        console.log("🔢 OTP code:", otp);
      }
    }

    // Always 200 to avoid email enumeration
    return res.json({ ok: true, message: "If that email exists, a reset link and OTP have been sent." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process request", details: err.message });
  }
};

/* --------------- VERIFY OTP -> return reset token --------------- */
exports.verifyOtp = async (req, res) => {
  const { value, error } = verifyOtpSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });

  const { email, otp } = value;
  try {
    const rec = otpStore.get(email);
    if (!rec) return res.status(400).json({ error: "Invalid or expired OTP" });

    // expiry
    if (Date.now() > rec.exp) {
      otpStore.delete(email);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // throttle attempts
    rec.attempts = (rec.attempts || 0) + 1;
    if (rec.attempts > 5) {
      otpStore.delete(email);
      return res.status(429).json({ error: "Too many attempts. Request a new OTP." });
    }

    const ok = await bcrypt.compare(otp, rec.hash);
    if (!ok) return res.status(400).json({ error: "Invalid OTP" });

    // success → issue the standard reset token your /reset-password expects
    const user = await User.findByPk(rec.uid);
    if (!user || user.email !== email) {
      otpStore.delete(email);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const token = issueResetToken(user);
    otpStore.delete(email); // one-time use
    return res.json({ ok: true, token });
  } catch (err) {
    return res.status(500).json({ error: "Failed to verify OTP", details: err.message });
  }
};

/* ---------------------- RESET PASSWORD ----------------------------- */
exports.resetPassword = async (req, res) => {
  const { value, error } = resetSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });

  const { token, password } = value;
  try {
    const payload = jwt.verify(token, RESET_SECRET);
    if (payload.purpose !== "pwdreset") throw new Error("Invalid token");

    const user = await User.findByPk(payload.uid);
    if (!user) return res.status(400).json({ error: "Invalid token" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.json({ ok: true, message: "Password has been reset. You can now log in." });
  } catch {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

/* ---------------------- DELETE USER (SuperAdmin) ------------------- */
// NOTE: Route should be protected with protect + allowRoles("SuperAdmin")
exports.removeUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // who is making the request (set by protect middleware)
    const meId = req.user?.id;

    const u = await User.findByPk(id);
    if (!u) return res.status(404).json({ error: "User not found" });

    // safety rails
    if (u.role === "SuperAdmin") {
      return res.status(400).json({ error: "Cannot delete a SuperAdmin account" });
    }
    if (u.id === meId) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const deleted = { id: u.id, username: u.username, email: u.email, role: u.role };
    await u.destroy();

    return res.json({ ok: true, message: "User deleted", deleted });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete user", details: err.message });
  }
};
