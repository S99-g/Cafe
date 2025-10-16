// models/Category.js
const Joi = require("joi");

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [2, 60], // reasonable length guard
        },
        set(val) {
          if (typeof val === "string") {
            this.setDataValue("name", val.trim());
          } else {
            this.setDataValue("name", val);
          }
        },
      },
    },
    {
      tableName: "Categories",
      indexes: [{ unique: true, fields: ["name"] }],
      timestamps: true,
    }
  );

  // Attach Joi schemas to use in routes/controllers
  Category.joiCreate = Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
  });

  Category.joiUpdate = Joi.object({
    name: Joi.string().trim().min(2).max(60),
  }).min(1);

  return Category;
};
