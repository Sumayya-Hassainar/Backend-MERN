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

// ---------------- Multer Setup ----------------
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure 'uploads/' folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- Product Routes ----------------

// Create product (vendor only)
router.post(
  "/",
  protect,
  vendorOnly,
  upload.array("images", 5), // 'images' = field name in form, max 5 files
  createProduct
);

// Update product
router.put(
  "/:id",
  protect,
  vendorOnly,
  upload.array("images", 5),
  updateProduct
);

// Get all products
router.get("/", getProducts);

// Get product by ID
router.get("/:id", getProductById);

// Get my products
router.get("/my/products", protect, getMyProducts);

// Delete product
router.delete("/:id", protect, vendorOnly, deleteProduct);

module.exports = router;
