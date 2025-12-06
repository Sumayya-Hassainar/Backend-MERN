const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrders,
  getVendorOrders,
  getOrderById,
  updateOrderStatus,
  assignOrderToVendor,
  deleteOrder,
} = require("../controllers/orderController");

const { protect, adminOnly, vendorOnly } = require("../middleware/authMiddleware");

/* ================= CUSTOMER ================= */

// ✅ Create Order
router.post("/", protect, createOrder);

// ✅ Get My Orders
router.get("/myorders", protect, getMyOrders);

/* ================= VENDOR ================= */

// ✅ Vendor Get Assigned Orders
router.get("/vendor", protect, vendorOnly, getVendorOrders);

/* ================= ADMIN ================= */

// ✅ Admin Get All Orders
router.get("/", protect, adminOnly, getOrders);

// ✅ Admin Assign Vendor → Status becomes "Assigned"
router.put("/:orderId/assign", protect, adminOnly, assignOrderToVendor);

// ✅ Admin Delete Order
router.delete("/:id", protect, adminOnly, deleteOrder);

/* ================= UNIVERSAL ================= */

// ✅ Get Single Order (Customer, Vendor, Admin)
router.get("/:id", protect, getOrderById);

// ✅ (Optional) Admin can force update status
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
