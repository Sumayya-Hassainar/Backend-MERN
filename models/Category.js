const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
