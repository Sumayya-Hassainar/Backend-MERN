// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const uploadProductImages = require("../middleware/uploadMiddleware");
const { protect, vendorOnly } = require("../middleware/authMiddleware");

// ---------- PUBLIC CUSTOMER ROUTES ----------
router.get("/", getProducts);       // GET /api/products
router.get("/:id", getProductById);  // GET /api/products/:id

// ---------- VENDOR-ONLY ROUTES ----------
// GET /api/products/vendor/my-products?category=...
router.get("/vendor/my-products", protect, vendorOnly, getMyProducts);

// CREATE product (with multiple images) – only vendor
router.post(
  "/",
  protect,
  vendorOnly,
  uploadProductImages,
  createProduct
);

// UPDATE product
router.put(
  "/:id",
  protect,
  vendorOnly,
  uploadProductImages,
  updateProduct
);

// DELETE product
router.delete(
  "/:id",
  protect,
  vendorOnly,
  deleteProduct
);

module.exports = router;
