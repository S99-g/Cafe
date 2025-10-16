// models/index.js
const Joi = require("joi");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};
db.Sequelize  = Sequelize;
db.sequelize  = sequelize;

// Load models (unchanged)
db.User     = require("./user")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.Product  = require("./product")(sequelize, Sequelize);

// Relationships (unchanged)
db.Category.hasMany(db.Product, { foreignKey: "categoryId" });
db.Product.belongsTo(db.Category, { foreignKey: "categoryId" });

// ---------------------------
// Centralized Joi definitions
// ---------------------------
const ALLOWED_ROLES = ["User", "Admin", "SuperAdmin"];

db.joi = {
  // Auth payloads
  auth: {
    register: Joi.object({
      username: Joi.string().trim().min(2).max(40).required(),
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(6).max(128).required(),
      role: Joi.string().valid(...ALLOWED_ROLES).default("User"),
    }),
    login: Joi.object({
      email: Joi.string().trim().email().required(),
      password: Joi.string().min(1).required(),
    }),
  },

  // Category payloads (use model-attached schemas if present)
  category: {
    create:
      db.Category.joiCreate ||
      Joi.object({
        name: Joi.string().trim().min(2).max(60).required(),
      }),
    update:
      db.Category.joiUpdate ||
      Joi.object({
        name: Joi.string().trim().min(2).max(60),
      }).min(1),
  },

  // Product payloads
  product: {
    create: Joi.object({
      name: Joi.string().trim().min(2).max(255).required(),
      price: Joi.number().precision(2).min(0).required(),
      description: Joi.string().allow("").max(2000),
      imageUrl: Joi.string().uri().allow("", null),
      categoryId: Joi.number().integer().positive().required(),
    }),
    update: Joi.object({
      name: Joi.string().trim().min(2).max(255),
      price: Joi.number().precision(2).min(0),
      description: Joi.string().allow("").max(2000),
      imageUrl: Joi.string().uri().allow("", null),
      categoryId: Joi.number().integer().positive(),
    }).min(1),
  },

  // User update (handy for admin edits)
  user: {
    update: Joi.object({
      username: Joi.string().trim().min(2).max(40),
      email: Joi.string().trim().email(),
      role: Joi.string().valid(...ALLOWED_ROLES),
      password: Joi.string().min(6).max(128),
    }).min(1),
  },
};

module.exports = db;
