const express = require("express");
const router = express.Router();
const { protect, vendorOnly } = require("../middleware/authMiddleware");
const {
  createProduct,
  updateProduct,
  getProducts,
  getProductById,
  getMyProducts,
  deleteProduct,
} = require("../controllers/productController");

// ✅ Use Cloudinary upload middleware
const upload = require("../middleware/uploadMiddleware"); // Multer–Cloudinary setup

// ---------------- ROUTES ----------------

// CREATE PRODUCT (vendor only)
router.post(
  "/",
  protect,
  vendorOnly,
  upload.array("images", 5), // Cloudinary handles the upload
  createProduct
);

// GET MY PRODUCTS (MUST come before :id)
router.get("/my/products", protect, getMyProducts);

// GET ALL PRODUCTS (public)
router.get("/", getProducts);

// GET PRODUCT BY ID
router.get("/:id", getProductById);

// UPDATE PRODUCT
router.put(
  "/:id",
  protect,
  vendorOnly,
  upload.array("images", 4), // Multer–Cloudinary handles new images
  updateProduct
);

// DELETE PRODUCT
router.delete("/:id", protect, vendorOnly, deleteProduct);

module.exports = router;
