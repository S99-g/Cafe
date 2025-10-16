// models/User.js
module.exports = (sequelize, DataTypes) => {
  const Joi = require("joi");

  // Keep roles consistent across app
  const ALLOWED_ROLES = ["User", "Admin", "SuperAdmin"];

  const User = sequelize.define(
    "User",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 50],
        },
        set(val) {
          const v = typeof val === "string" ? val.trim() : val;
          this.setDataValue("username", v);
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(val) {
          const v = typeof val === "string" ? val.trim().toLowerCase() : val;
          this.setDataValue("email", v);
        },
      },

      // Store the HASHED password (hashing happens in controller)
      password: { type: DataTypes.STRING, allowNull: false },

      // Default aligned with your controllers/middleware
      role: {
        type: DataTypes.STRING,
        defaultValue: "User",
        validate: { isIn: [ALLOWED_ROLES] },
      },
    },
    {
      tableName: "Users",
      timestamps: true,
      indexes: [{ fields: ["email"] }, { fields: ["username"] }],
    }
  );

  // ---------------------------
  // Joi schemas for payloads
  // ---------------------------

  // Public registration (role optional; backend will coerce to "User" anyway)
  User.joiRegister = Joi.object({
    username: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid(...ALLOWED_ROLES).default("User"),
  });

  // Login
  User.joiLogin = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().required(),
  });

  // Admin-only create (explicit role)
  User.joiCreateByAdmin = Joi.object({
    username: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid(...ALLOWED_ROLES).required(),
  });

  // Update (partial)
  User.joiUpdate = Joi.object({
    username: Joi.string().trim().min(2).max(50),
    email: Joi.string().trim().lowercase().email(),
    password: Joi.string().min(6).max(128),
    role: Joi.string().valid(...ALLOWED_ROLES),
  }).min(1);

  return User;
};
