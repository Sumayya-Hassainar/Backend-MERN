// routes/activityLogRoutes.js
const express = require("express");
const router = express.Router();

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  getActivityLogs,
  getActivityLogById,
  createActivityLog,
  updateActivityLog,
  deleteActivityLog,
} = require("../controllers/activityLogController");

// GET all logs - admin only
router.get("/", protect, adminOnly, getActivityLogs);

// GET single log - admin only
router.get("/:id", protect, adminOnly, getActivityLogById);

// CREATE log - admin only (you can relax this if you want)
router.post("/", protect, adminOnly, createActivityLog);

// UPDATE log - admin only
router.put("/:id", protect, adminOnly, updateActivityLog);

// DELETE log - admin only
router.delete("/:id", protect, adminOnly, deleteActivityLog);

module.exports = router;
