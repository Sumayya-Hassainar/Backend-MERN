const express = require("express");

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

const router = express.Router();

/* ================= CUSTOMER ================= */
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);

/* ================= VENDOR ================= */
router.get("/vendor", protect, vendorOnly, getVendorOrders);

/* ================= ADMIN ================= */
router.get("/", protect, adminOnly, getOrders);
router.put("/:orderId/assign", protect, adminOnly, assignOrderToVendor);
router.delete("/:id", protect, adminOnly, deleteOrder);

/* ================= UNIVERSAL ================= */
router.get("/:id", protect, getOrderById);

module.exports = router;
