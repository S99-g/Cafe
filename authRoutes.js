// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const Joi = require("joi");
const { Op } = require("sequelize");
const { User } = require("../models");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// Load controller (CJS/ESM safe)
let auth = require("../controllers/authController");
if (auth && auth.default) auth = auth.default;

const LIKE = Op.iLike || Op.like;

/* ----------------------------- Validator helper ----------------------------- */
const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map((d) => d.message),
    });
  }
  req[source] = value;
  next();
};

/* --------------------------------- Schemas ---------------------------------- */
const listUsersQuerySchema = Joi.object({
  q: Joi.string().trim().allow("").max(100).default(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid("User", "Admin", "SuperAdmin").default("User"),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d{6}$/).required(),
});

// for /users/:id (SuperAdmin delete)
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

/* ---------------------------------- Routes ---------------------------------- */
/** GET /api/auth/users (Admin/SuperAdmin) */
router.get(
  "/users",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(listUsersQuerySchema, "query"),
  async (req, res) => {
    try {
      const { page, limit, q } = req.query;
      const where = {};
      if (q) {
        where[Op.or] = [
          { username: { [LIKE]: `%${q}%` } },
          { email: { [LIKE]: `%${q}%` } },
        ];
      }
      const offset = (page - 1) * limit;
      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: ["id", "username", "email", "role", "createdAt", "updatedAt"],
        order: [["id", "ASC"]],
        limit,
        offset,
      });
      res.json({
        data: rows,
        meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users", details: err?.message });
    }
  }
);

// Auth
router.post("/register", validate(registerSchema), auth.register);
router.post("/login", validate(loginSchema), auth.login);

// Forgot / Reset (token flow)
if (typeof auth?.forgotPassword === "function") {
  router.post("/forgot-password", validate(forgotSchema), auth.forgotPassword);
}
if (typeof auth?.resetPassword === "function") {
  router.post("/reset-password", validate(resetSchema), auth.resetPassword);
}

// OTP verification -> returns reset token
if (typeof auth?.verifyOtp === "function") {
  router.post("/verify-otp", validate(verifyOtpSchema), auth.verifyOtp);
}

// SuperAdmin: delete a user
if (typeof auth?.removeUser === "function") {
  router.delete(
    "/users/:id",
    protect,
    allowRoles("SuperAdmin"),
    validate(idParamSchema, "params"),
    auth.removeUser
  );
}

module.exports = router;
