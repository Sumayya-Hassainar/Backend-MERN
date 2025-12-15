const express = require("express");
const router = express.Router();

const {
  createStatus,
  updateStatus,
  deleteStatus,
  getStatuses,
  getOrderTracking,
} = require("../controllers/orderStatusController");

const {
  protect,
  vendorOnly,
  adminOnly,
  customerOnly,
} = require("../middleware/authMiddleware");

/* ================= ROUTES ================= */

// Vendor creates a status
router.post("/", protect, vendorOnly, createStatus);

// Vendor OR Admin updates a status
router.put("/:statusId", protect, (req, res, next) => {
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, updateStatus);

// Vendor OR Admin deletes a status
router.delete("/:statusId", protect, (req, res, next) => {
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, deleteStatus);

// Vendor OR Admin view order status timeline
router.get("/order/:orderId", protect, (req, res, next) => {
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, getStatuses);

// Customer tracking page
router.get("/track/:orderId", protect, customerOnly, getOrderTracking);

module.exports = router;
