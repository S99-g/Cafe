// controllers/productController.js
const Joi = require("joi");
const { Product, Category, Sequelize } = require("../models");
const { Op } = Sequelize;

// Case-insensitive LIKE if supported (PG), else LIKE
const LIKE = Op.iLike || Op.like;

/* ---------------------- Joi Schemas ---------------------- */
const listSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  q: Joi.string().trim().max(200).allow(""),
  categoryId: Joi.number().integer().positive().optional(),
});

// Accept http(s), root-relative, or simple filenames (for /public/images/*)
const imageSchema = Joi.string()
  .allow("", null)
  .max(500)
  .custom((val, helpers) => {
    if (!val) return val;
    if (/^https?:\/\//i.test(val)) return val; // full URL
    if (val.startsWith("/")) return val;       // root-relative
    if (/^[\w\-./]+$/.test(val)) return val;   // simple filename/path
    return helpers.error("any.invalid");
  }, "image path/url validation");

const createSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  // allow number  or a "12.34" string for DECIMAL
  price: Joi.alternatives().try(
    Joi.number().positive().precision(2),
    Joi.string().pattern(/^\d+(\.\d{1,2})?$/)
  ).required(),
  description: Joi.string().allow("", null),
  imageUrl: imageSchema,
  categoryId: Joi.number().integer().positive().required(),
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255),
  price: Joi.alternatives().try(
    Joi.number().positive().precision(2),
    Joi.string().pattern(/^\d+(\.\d{1,2})?$/)
  ),
  description: Joi.string().allow("", null),
  imageUrl: imageSchema,
  categoryId: Joi.number().integer().positive(),
}).min(1);

/* ---------------------- Controllers ---------------------- */

// GET /api/products?q=&page=&limit=&categoryId=
exports.getAll = async (req, res) => {
  try {
    const { value, error } = listSchema.validate(req.query, { abortEarly: false, convert: true, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }

    const page = value.page;
    const limit = value.limit;
    const offset = (page - 1) * limit;

    const where = {};
    if (value.q) {
      where[Op.or] = [
        { name:        { [LIKE]: `%${value.q}%` } },
        { description: { [LIKE]: `%${value.q}%` } },
      ];
    }
    if (value.categoryId) where.categoryId = value.categoryId;

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      offset,
      limit
    });

    res.json({ data: rows, meta: { page, limit, total: count, pages: Math.ceil(count / limit) } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.getOne = async (req, res) => {
  const prod = await Product.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ["id", "name"] }]
  });
  if (!prod) return res.status(404).json({ error: "Not found" });
  res.json(prod);
};

exports.create = async (req, res) => {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }
    const created = await Product.create(value);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: "Validation failed", details: error.details.map(d => d.message) });
    }

    const prod = await Product.findByPk(req.params.id);
    if (!prod) return res.status(404).json({ error: "Not found" });

    await prod.update(value);
    res.json(prod);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

exports.remove = async (req, res) => {
  const prod = await Product.findByPk(req.params.id);
  if (!prod) return res.status(404).json({ error: "Not found" });
  await prod.destroy();
  res.status(204).end();
};
