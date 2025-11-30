// routes/categoryRoutes.js
const express = require("express");
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .post(protect, adminOnly, createCategory)
  .get(getCategories);

router.route("/:id")
  .get(getCategoryById)
  .put(protect, adminOnly, updateCategory)
  .delete(protect, adminOnly, deleteCategory);

module.exports = router;
