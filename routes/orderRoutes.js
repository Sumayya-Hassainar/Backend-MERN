const express = require("express");
const router = express.Router();

const {
  createOrder,
  assignOrderToVendor,
  updateOrderStatus,
  getOrders,
  getMyOrders,
  getVendorOrders,
  deleteOrder,
  getOrderById,
} = require("../controllers/orderController");

const { protect, adminOnly, vendorOnly } = require("../middleware/authMiddleware");

/* ================= CUSTOMER ================= */
router.get("/myorders", protect, getMyOrders);

/* ================= VENDOR ================= */
router.get("/vendor", protect, vendorOnly, getVendorOrders);

/* ================= ADMIN ================= */
router.get("/", protect, adminOnly, getOrders);

/* ================= CREATE ================= */
router.post("/", protect, createOrder);

/* ================= ASSIGN ================= */
router.put("/:orderId/assign", protect, adminOnly, assignOrderToVendor);

/* ================= STATUS ================= */
router.put("/:id/status", protect, updateOrderStatus);

/* ================= DELETE ================= */
router.delete("/:id", protect, adminOnly, deleteOrder);

/* ================= SINGLE ORDER (MUST BE LAST) ================= */
router.get("/:id", protect, getOrderById);

module.exports = router;
