const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getMyOrders,
  getSingleOrder,   // ✅
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// Customer creates an order
router.post("/", protect, createOrder);

// Customer fetches their own orders
router.get("/my", protect, getMyOrders);

// Customer fetches one order detail
router.get("/:id", protect, getSingleOrder);

// Admin-only list
router.get("/", protect, adminOnly, getOrders);

// Admin-only update order status
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

// Admin-only delete order
router.delete("/:id", protect, adminOnly, deleteOrder);

module.exports = router;
