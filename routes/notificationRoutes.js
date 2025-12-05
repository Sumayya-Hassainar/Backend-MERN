const express = require("express");
const router = express.Router();

const {
  createNotification,
  getNotifications,
  getMyNotifications,
  markNotificationAsRead,
  markAllMyNotificationsAsRead,
} = require("../controllers/notificationController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

/* =========================================================
   ✅ CREATE NOTIFICATION (Admin Only)
========================================================= */
router.post("/", protect, adminOnly, createNotification);

/* =========================================================
   ✅ ADMIN: GET ALL NOTIFICATIONS
========================================================= */
router.get("/", protect, adminOnly, getNotifications);

/* =========================================================
   ✅ USER / VENDOR: GET MY NOTIFICATIONS
========================================================= */
router.get("/my", protect, getMyNotifications);

/* =========================================================
   ✅ MARK SINGLE NOTIFICATION AS READ
========================================================= */
router.put("/read/:id", protect, markNotificationAsRead);

/* =========================================================
   ✅ MARK ALL NOTIFICATIONS AS READ
========================================================= */
router.put("/read-all", protect, markAllMyNotificationsAsRead);

module.exports = router;
