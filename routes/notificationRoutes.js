const express = require("express");
const {
  createNotification,
  getNotifications,
  getMyNotifications,
  markNotificationAsRead,
  markAllMyNotificationsAsRead,
  notifyAllAdmins,
} = require("../controllers/notificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin can create generic notifications and see all
router
  .route("/")
  .post(protect, adminOnly, createNotification)
  .get(protect, adminOnly, getNotifications);

// Logged-in user: see own notifications
router.get("/me", protect, getMyNotifications);

// Mark one notification as read
router.patch("/:id/read", protect, markNotificationAsRead);

// Mark all my notifications as read
router.patch("/mark-all/read", protect, markAllMyNotificationsAsRead);

// Send to all admins
router.post("/notify-admins", protect, adminOnly, notifyAllAdmins);

module.exports = router;
