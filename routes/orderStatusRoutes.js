const express = require("express");
const router = express.Router();

const {
  getAllOrderStatuses,
  createOrderStatus,
  updateStatusMaster,
  deleteOrderStatus,
  updateOrderStatusByVendor,
  getOrderStatusByOrderId,
} = require("../controllers/orderStatusController");

const { protect, adminOnly, vendorOnly } = require("../middleware/authMiddleware");

/* =====================================================
   ✅ ADMIN – STATUS MASTER
===================================================== */

// ✅ Get All Status Types
router.get("/", protect, adminOnly, getAllOrderStatuses);

// ✅ Create Status
router.post("/", protect, adminOnly, createOrderStatus);

// ✅ Update Status
router.put("/:id", protect, adminOnly, updateStatusMaster);

// ✅ Delete Status
router.delete("/:id", protect, adminOnly, deleteOrderStatus);

/* =====================================================
   ✅ VENDOR – UPDATE ORDER STATUS
===================================================== */

// ✅ Vendor Updates Order Progress
router.put(
  "/vendor/:orderId/status",
  protect,
  vendorOnly,
  updateOrderStatusByVendor
);

/* =====================================================
   ✅ CUSTOMER – LIVE TRACKING
===================================================== */

// ✅ Customer View Tracking
router.get(
  "/customer/:orderId",
  protect,
  getOrderStatusByOrderId
);

module.exports = router;
