// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const Joi = require("joi");
const { Op } = require("sequelize");
const { Product, Category } = require("../models");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// Use case-insensitive LIKE on PG; fall back to LIKE elsewhere
const LIKE = Op.iLike || Op.like;

/* ----------------------------- Joi helpers ----------------------------- */
const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.details.map(d => d.message),
    });
  }
  req[source] = value; // replace with validated/normalized values
  next();
};

/* ----------------------------- Joi schemas ----------------------------- */
// GET /api/products?q=&page=&limit=&categoryId=
const listQuerySchema = Joi.object({
  q: Joi.string().trim().allow("").max(100).default(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  categoryId: Joi.number().integer().positive().optional(),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Allow either http(s) URL or root-relative path
const urlOrRootPath = Joi.string().custom((val, helpers) => {
  if (val == null || val === "") return val;
  if (typeof val !== "string") return helpers.error("any.invalid");
  if (/^https?:\/\//i.test(val) || val.startsWith("/")) return val;
  return helpers.error("any.invalid");
}, "http(s) URL or root-relative path");

// POST create
const createProductSchema =
  (Product && Product.joiCreate) || Joi.object({
    name: Joi.string().trim().min(2).max(255).required(),
    price: Joi.number().min(0).precision(2).required(),
    description: Joi.string().allow("").max(5000).optional(),
    imageUrl: urlOrRootPath.allow(null, "").optional(),
    categoryId: Joi.number().integer().positive().required(),
  });

// PUT update (partial allowed, at least one field)
const updateProductSchema =
  (Product && Product.joiUpdate) || Joi.object({
    name: Joi.string().trim().min(2).max(255).optional(),
    price: Joi.number().min(0).precision(2).optional(),
    description: Joi.string().allow("").max(5000).optional(),
    imageUrl: urlOrRootPath.allow(null, "").optional(),
    categoryId: Joi.number().integer().positive().optional(),
  }).min(1);

/* -------------------------------- Routes ------------------------------- */

// GET /api/products  (list with pagination/search/filter)
router.get(
  "/",
  validate(listQuerySchema, "query"),
  async (req, res) => {
    const { page, limit, q, categoryId } = req.query;

    const where = {};
    if (q) {
      where[Op.or] = [
        { name:        { [LIKE]: `%${q}%` } },
        { description: { [LIKE]: `%${q}%` } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    res.json({
      data: rows,
      meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  }
);

// POST /api/products  (create)  Admin & SuperAdmin
router.post(
  "/",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(createProductSchema),
  async (req, res) => {
    try {
      const p = await Product.create(req.body); // model setter trims imageUrl if you added it
      res.status(201).json(p);
    } catch (err) {
      return res.status(400).json({
        error: err.message,
        details: Array.isArray(err?.errors) ? err.errors.map(e => e.message) : undefined,
      });
    }
  }
);

// PUT /api/products/:id  (update)  Admin & SuperAdmin
router.put(
  "/:id",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  async (req, res) => {
    try {
      const p = await Product.findByPk(req.params.id);
      if (!p) return res.status(404).json({ ok: false, error: "Not found" });

      await p.update(req.body);
      res.json(p);
    } catch (err) {
      return res.status(400).json({
        error: err.message,
        details: Array.isArray(err?.errors) ? err.errors.map(e => e.message) : undefined,
      });
    }
  }
);

// DELETE /api/products/:id  (delete)  Admin & SuperAdmin
router.delete(
  "/:id",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(idParamSchema, "params"),
  async (req, res) => {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ ok: false, error: "Not found" });
    await p.destroy();
    res.json({ ok: true, message: "Product deleted", deleted: { id: p.id, name: p.name } });
  }
);

// GET /api/products/:id  (details)
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  async (req, res) => {
    const p = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: "Category" }],
    });
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
  }
);

module.exports = router;
