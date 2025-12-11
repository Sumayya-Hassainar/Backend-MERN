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

const upload = require("../middleware/uploadMiddleware"); // cloudinary multer
const { protect, vendorOnly } = require("../middleware/authMiddleware");


// ---------------- PUBLIC ROUTES ----------------
router.get("/", getProducts);         // GET /api/products



// ❗ IMPORTANT: place vendor route BEFORE /:id
router.get("/vendor/my-products", protect, vendorOnly, getMyProducts);



// ---------------- VENDOR ROUTES ----------------
router.post(
  "/",
  protect,
  vendorOnly,
  upload,          // cloudinary uploader
  createProduct
);

router.put(
  "/:id",
  protect,
  vendorOnly,
  upload,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  vendorOnly,
  deleteProduct
);



// ---------------- PRODUCT DETAILS ----------------
router.get("/:id", getProductById); // GET /api/products/123

module.exports = router;
