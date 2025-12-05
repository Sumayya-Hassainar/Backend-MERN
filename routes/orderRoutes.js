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
/// SPECIFIC ROUTES FIRST
router.get("/myorders", protect, getMyOrders);
router.get("/vendor", protect, vendorOnly, getVendorOrders);
router.post("/", protect, createOrder);
router.put("/assign", protect, adminOnly, assignOrderToVendor);
router.put("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);
router.get("/order/:id", protect, getOrderById);

module.exports = router;
