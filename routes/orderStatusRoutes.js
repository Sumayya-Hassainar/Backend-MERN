const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/orderStatusController");
const { protect, vendorOnly, customerOnly } = require("../middleware/authMiddleware");

/* ================= VENDOR ONLY ================= */
// Vendor creates a new status
router.post("/", protect, vendorOnly, ctrl.createStatus);

// Vendor updates a status
router.put("/:statusId", protect, vendorOnly, ctrl.updateStatus);

// Vendor deletes a status
router.delete("/:statusId", protect, vendorOnly, ctrl.deleteStatus);

/* ================= UNIVERSAL ================= */
// Get all statuses for a specific order (Vendor/Admin/Customer)
router.get("/order/:orderId", protect, ctrl.getStatuses);

// Customer tracking for a single order
router.get("/track/:orderId", protect, customerOnly, ctrl.getOrderTracking);

module.exports = router;
