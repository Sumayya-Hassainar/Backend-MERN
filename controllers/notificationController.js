const Notification = require("../models/Notification");
const User = require("../models/User");

/* =======================================================
   ✅ CREATE NOTIFICATION (Admin Only / Optional Manual API)
======================================================== */
const createNotification = async (req, res) => {
  try {
    const { recipient, recipientModel, message, type, orderId } = req.body;

    if (!recipient || !message || !type) {
      return res.status(400).json({ message: "Recipient, message, and type are required" });
    }

    const notification = await Notification.create({
      recipient,
      recipientModel,
      message,
      type,      // Order | Payment | System | Dispute
      orderId,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
   ✅ ADMIN: GET ALL NOTIFICATIONS
======================================================== */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("recipient", "name email role");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
   ✅ USER / VENDOR: GET MY NOTIFICATIONS
======================================================== */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("recipient", "name email role");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get my notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
   ✅ MARK SINGLE NOTIFICATION AS READ
======================================================== */
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
   ✅ MARK ALL MY NOTIFICATIONS AS READ
======================================================== */
const markAllMyNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* =======================================================
   ✅ NOTIFY ALL ADMINS
======================================================== */
const notifyAllAdmins = async (message, orderId = null) => {
  try {
    const admins = await User.find({ role: "admin" });

    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipient: admin._id,
          recipientModel: "User", // Admin stored as User
          message,
          type: "Order",
          orderId,
        })
      )
    );
  } catch (error) {
    console.error("Notify all admins error:", error);
  }
};

/* =======================================================
   ✅ NOTIFY VENDOR ON ORDER ASSIGNMENT
======================================================== */
const notifyVendorOnOrder = async ({ vendorId, orderId }) => {
  try {
    await Notification.create({
      recipient: vendorId,
      recipientModel: "User",
      message: `📦 New order assigned: ${orderId}`,
      type: "Order",
      orderId,
    });
  } catch (error) {
    console.error("Notify vendor error:", error);
  }
};

/* =======================================================
   ✅ NOTIFY CUSTOMER WHEN ORDER STATUS UPDATES
======================================================== */
const notifyCustomerOnStatusUpdate = async ({ customerId, status, orderId }) => {
  try {
    await Notification.create({
      recipient: customerId,
      recipientModel: "User",
      message: `✅ Your order is now ${status}`,
      type: "Order",
      orderId,
    });
  } catch (error) {
    console.error("Notify customer error:", error);
  }
};

/* =======================================================
   ✅ EXPORTS
======================================================== */
module.exports = {
  createNotification,
  getNotifications,
  getMyNotifications,
  markNotificationAsRead,
  markAllMyNotificationsAsRead,
  notifyAllAdmins,
  notifyVendorOnOrder,
  notifyCustomerOnStatusUpdate,
};
