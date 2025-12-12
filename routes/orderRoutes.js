const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrders,
  getVendorOrders,
  getOrderById,
  assignOrderToVendor,
  deleteOrder,
} = require("../controllers/orderController");

const {
  protect,
  adminOnly,
  vendorOnly,
} = require("../middleware/authMiddleware");

/* ================= CUSTOMER ================= */
// Create new order
router.post("/", protect, createOrder);

// Get logged-in customer orders (IMPORTANT: keep ABOVE admin "/")
router.get("/myorders", protect, getMyOrders);

/* ================= VENDOR ================= */
// Vendor sees orders assigned to them
router.get("/vendor", protect, vendorOnly, getVendorOrders);

/* ================= ADMIN ================= */
// Admin gets ALL orders
router.get("/", protect, adminOnly, getOrders);

// Assign vendor to order
router.put("/:orderId/assign", protect, adminOnly, assignOrderToVendor);

// Delete order
router.delete("/:id", protect, adminOnly, deleteOrder);

/* ================= UNIVERSAL ================= */
// Get single order (Customer + Vendor + Admin)
router.get("/:id", protect, getOrderById);

module.exports = router;
