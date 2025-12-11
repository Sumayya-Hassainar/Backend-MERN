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

const { protect, adminOnly, vendorOnly } = require("../middleware/authMiddleware");

/* ================= CUSTOMER ================= */
// Create a new order
router.post("/", protect, createOrder);

// Get orders for logged-in customer
router.get("/myorders", protect, getMyOrders);

/* ================= VENDOR ================= */
// Get orders assigned to vendor
router.get("/vendor", protect, vendorOnly, getVendorOrders);

/* ================= ADMIN ================= */
// Admin gets all orders
router.get("/", protect, adminOnly, getOrders);

// Admin assigns vendor to order → status becomes "Assigned"
router.put("/:orderId/assign", protect, adminOnly, assignOrderToVendor);

// Admin deletes an order
router.delete("/:id", protect, adminOnly, deleteOrder);

/* ================= UNIVERSAL ================= */
// Get single order (Customer, Vendor, Admin)
router.get("/:id", protect, getOrderById);

module.exports = router;
