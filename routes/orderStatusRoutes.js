const express = require("express");
const router = express.Router();

const orderStatusController = require("../controllers/orderStatusController");
const {
  protect,
  vendorOnly,
  adminOnly,
  customerOnly,
} = require("../middleware/authMiddleware");

const {
  createStatus,
  updateStatus,
  deleteStatus,
  getStatuses,
  getOrderTracking,
} = orderStatusController;

/* ================= ROUTES ================= */

// Vendor creates status
router.post("/", protect, vendorOnly, createStatus);

// Vendor or Admin update status
router.put("/:statusId", protect, (req, res, next) => {
  if (!["vendor", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, updateStatus);

// Vendor or Admin delete status
router.delete("/:statusId", protect, (req, res, next) => {
  if (!["vendor", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, deleteStatus);

// Vendor or Admin view order statuses
router.get("/order/:orderId", protect, (req, res, next) => {
  if (!["vendor", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, getStatuses);

// Customer tracking
router.get("/track/:orderId", protect, customerOnly, getOrderTracking);

module.exports = router;
