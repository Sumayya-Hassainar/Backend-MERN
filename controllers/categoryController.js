const Category = require('../models/Category');

// Create
const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};

// Read All
const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
};

// Read One
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.status(200).json(category);
};

// Update
const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(category);
};

// Delete
const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Category deleted" });
};

// Export all functions
module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
