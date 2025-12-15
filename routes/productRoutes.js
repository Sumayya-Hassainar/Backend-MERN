const express = require("express");
const router = express.Router();
const { protect, vendorOnly } = require("../middleware/authMiddleware");
const uploadProductImages = require("../middleware/uploadMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Create product (vendor only)
router.post("/", protect, vendorOnly, uploadProductImages, createProduct);

// Get my products (vendor)
router.get("/vendor/my-products", protect, getMyProducts);

// Get all products
router.get("/", getProducts);

// Get product by ID
router.get("/:id", getProductById);

// Update product
router.put("/:id", protect, vendorOnly, uploadProductImages, updateProduct);

// Delete product
router.delete("/:id", protect, vendorOnly, deleteProduct);

module.exports = router;
