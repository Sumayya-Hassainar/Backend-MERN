// routes/orderStatusRoutes.js

const express = require("express");
const router = express.Router();

const {
  getAllOrderStatuses,
  createOrderStatus,
  updateStatusMaster,
  deleteOrderStatus,

  // ✅ New functional status updates
  updateOrderStatusByVendor,
  getOrderStatusByOrderId,
} = require("../controllers/orderStatusController");

const { protect, adminOnly, vendorOnly } = require("../middleware/authMiddleware");

/* =====================================================
   ✅ ADMIN – STATUS MASTER CONTROL
===================================================== */

// ✅ GET all order statuses (Admin only)
router.get("/", protect, adminOnly, getAllOrderStatuses);

// ✅ CREATE new order status (Admin only)
router.post("/", protect, adminOnly, createOrderStatus);

// ✅ UPDATE status master (Admin only)
router.put("/:id", protect, adminOnly, updateStatusMaster);

// ✅ DELETE status (Admin only)
router.delete("/:id", protect, adminOnly, deleteOrderStatus);

/* =====================================================
   ✅ VENDOR – UPDATE REAL ORDER STATUS
===================================================== */

// ✅ Vendor updates assigned order status
// PATCH /api/order-status/vendor/:orderId
router.patch(
  "/vendor/:orderId",
  protect,
  vendorOnly,
  updateOrderStatusByVendor
);

/* =====================================================
   ✅ CUSTOMER – GET LIVE ORDER STATUS
===================================================== */

// ✅ Customer fetches order status
// GET /api/order-status/order/:orderId
router.get(
  "/order/:orderId",
  protect,
  getOrderStatusByOrderId
);

module.exports = router;
