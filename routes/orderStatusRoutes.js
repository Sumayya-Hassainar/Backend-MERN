// routes/orderStatusRoutes.js
const express = require("express");
const router = express.Router();

const {
  getAllOrderStatuses,
  createOrderStatus,
  updateStatusMaster,
  deleteOrderStatus,
} = require("../controllers/orderStatusController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET /api/order-status
router.get("/", protect, adminOnly, getAllOrderStatuses);

// POST /api/order-status
router.post("/", protect, adminOnly, createOrderStatus);

// PUT /api/order-status/:id
router.put("/:id", protect, adminOnly, updateStatusMaster);

// DELETE /api/order-status/:id
router.delete("/:id", protect, adminOnly, deleteOrderStatus);

module.exports = router;
