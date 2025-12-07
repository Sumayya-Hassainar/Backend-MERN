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

const { adminOnly, vendorOnly, customerOnly } = require("../middleware/authMiddleware");

/* ================= ADMIN ROUTES ================= */

// ✅ Admin - View all statuses
router.get("/", adminOnly, getAllOrderStatuses);

// ✅ Admin - Update status master
router.put("/:id", adminOnly, updateStatusMaster);

// ✅ Admin - Delete status
router.delete("/:id", adminOnly, deleteOrderStatus);

/* ================= VENDOR ROUTES ================= */

// ✅ Vendor - Create new status
router.post("/vendor", vendorOnly, createOrderStatusByVendor);

// ✅ Vendor - Update order status
router.patch(
  "/vendor/:orderId/status",
  vendorOnly,
  updateOrderStatusByVendor
);

/* ================= CUSTOMER ROUTES ================= */

// ✅ Customer - Track order status
router.get(
  "/customer/:orderId",
  customerOnly,
  getOrderStatusByOrderId
);

module.exports = router;
