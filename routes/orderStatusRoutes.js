const express = require("express");
const router = express.Router();

const {
  getAllOrderStatuses,
  updateStatusMaster,
  deleteOrderStatus,
  createOrderStatusByVendor,
  updateOrderStatusByVendor,
  getOrderStatusByOrderId,
} = require("../controllers/orderStatusController");

const {
  protect,
  adminOnly,
  vendorOnly,
  customerOnly,
} = require("../middleware/authMiddleware");

/* ================= ADMIN ROUTES ================= */
// Admin - View all statuses
router.get("/", protect, adminOnly, getAllOrderStatuses);

// Admin - Update status master
router.put("/:id", protect, adminOnly, updateStatusMaster);

// Admin - Delete status
router.delete("/:id", protect, adminOnly, deleteOrderStatus);

/* ================= VENDOR ROUTES ================= */
// Vendor - Create new status (if needed)
router.post("/vendor", protect, vendorOnly, createOrderStatusByVendor);

// Vendor - Update order status
router.patch(
  "/vendor/:orderId/status",
  protect,
  vendorOnly,
  updateOrderStatusByVendor
);

/* ================= CUSTOMER ROUTES ================= */
// Customer - Track order
router.get(
  "/customer/:orderId",
  protect,
  customerOnly,
  getOrderStatusByOrderId
);

module.exports = router;
