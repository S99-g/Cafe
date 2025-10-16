// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Joi = require("joi");

  // Helper: accept either http(s) URL or a root-relative path (e.g. "/images/..")
  const imageUrlSchema = Joi.string()
    .allow("", null)
    .custom((value, helpers) => {
      if (!value) return value; // empty/nullable allowed
      if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
      return helpers.error("any.invalid");
    }, "http(s) URL or root-relative path")
    .messages({
      "any.invalid": 'imageUrl must be an http(s) URL or start with "/"',
    });

  const Product = sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 255],
        },
      },

      // Use DECIMAL for currency to avoid float rounding issues
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
        },
      },

      description: {
        type: DataTypes.TEXT, // longer copy
        allowNull: true,
      },

      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true, // optional
        // Accept either a full http(s) URL OR a root-relative path (e.g. /images/..)
        validate: {
          isValidUrlOrPath(value) {
            if (value == null || value === "") return; // optional field
            if (typeof value !== "string") {
              throw new Error("imageUrl must be a string");
            }
            const isHttp = /^https?:\/\//i.test(value);
            const isRootRelative = value.startsWith("/");
            if (!isHttp && !isRootRelative) {
              throw new Error(
                "imageUrl must be an http(s) URL or start with '/' (root-relative path)"
              );
            }
          },
        },
        // Trim whitespace and store null if empty
        set(val) {
          const v = typeof val === "string" ? val.trim() : val;
          this.setDataValue("imageUrl", v || null);
        },
      },

      // FK to Category
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "Products",
      timestamps: true,
      indexes: [
        { fields: ["name"] },
        { fields: ["categoryId"] },
      ],
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "Category",
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // or 'SET NULL' if you allow deleting categories
    });
  };

  // ---------------------------
  // Joi payload validation
  // ---------------------------
  Product.joiCreate = Joi.object({
    name: Joi.string().trim().min(2).max(255).required(),
    price: Joi.number().precision(2).min(0).required(),
    description: Joi.string().allow("", null),
    imageUrl: imageUrlSchema,
    categoryId: Joi.number().integer().positive().required(),
  });

  Product.joiUpdate = Joi.object({
    name: Joi.string().trim().min(2).max(255),
    price: Joi.number().precision(2).min(0),
    description: Joi.string().allow("", null),
    imageUrl: imageUrlSchema,
    categoryId: Joi.number().integer().positive(),
  }).min(1);

  return Product;
};
