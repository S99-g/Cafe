// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();

const Joi = require("joi");
const { Op } = require("sequelize");
const { Category, Product } = require("../models");
const { protect, allowRoles } = require("../middleware/authMiddleware");

// ✅ pick case-insensitive LIKE when available (Postgres), else LIKE
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
      details: error.details.map((d) => d.message),
    });
  }
  req[source] = value; // replace with validated version
  next();
};

/* ----------------------------- Joi schemas ----------------------------- */
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createCategorySchema =
  (Category && Category.joiCreate) ||
  Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
  });

const updateCategorySchema =
  (Category && Category.joiUpdate) ||
  Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
  });

const listCatProductsQuerySchema = Joi.object({
  q: Joi.string().trim().allow("").max(100).default(""),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
});

/* -------------------------------- Routes ------------------------------- */

// list
router.get("/", async (req, res) => {
  const cats = await Category.findAll({ order: [["id", "ASC"]] });
  res.json(cats);
});

// create
router.post(
  "/",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(createCategorySchema),
  async (req, res) => {
    const { name } = req.body;
    const cat = await Category.create({ name });
    res.status(201).json(cat);
  }
);

// update
router.put(
  "/:id",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(idParamSchema, "params"),
  validate(updateCategorySchema),
  async (req, res) => {
    const cat = await Category.findByPk(req.params.id);
    if (!cat)
      return res.status(404).json({ ok: false, error: "Category not found" });
    await cat.update({ name: req.body.name });
    res.json(cat);
  }
);

// delete (with JSON response)
router.delete(
  "/:id",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  validate(idParamSchema, "params"),
  async (req, res) => {
    try {
      const cat = await Category.findByPk(req.params.id);
      if (!cat)
        return res
          .status(404)
          .json({ ok: false, error: "Category not found" });
      const deleted = { id: cat.id, name: cat.name };
      await cat.destroy();
      return res
        .status(200)
        .json({ ok: true, message: "Category deleted", deleted });
    } catch (err) {
      if (err?.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
          ok: false,
          error: "Category has related products",
          code: "FK_CONSTRAINT",
        });
        }
      return res.status(500).json({
        ok: false,
        error: "Failed to delete category",
        details: err.message,
      });
    }
  }
);

// get one
router.get("/:id", validate(idParamSchema, "params"), async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  res.json(cat);
});

// ✅ GET /api/categories/:id/products  -> products in the category (with paging/search)
router.get(
  "/:id/products",
  validate(idParamSchema, "params"),
  validate(listCatProductsQuerySchema, "query"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const cat = await Category.findByPk(id);
      if (!cat) return res.status(404).json({ error: "Category not found" });

      const { page, limit, q } = req.query;

      const where = { categoryId: id };
      if (q) where.name = { [LIKE]: `%${q}%` }; // ✅ LIKE works on both PG and others

      const offset = (page - 1) * limit;
      const { rows, count } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        order: [["id", "ASC"]],
      });

      return res.json({
        category: { id: cat.id, name: cat.name },
        data: rows,
        meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
      });
    } catch (err) {
      return res.status(500).json({
        error: "Failed to fetch products",
        details: err.message,
      });
    }
  }
);

module.exports = router; // <-- important
