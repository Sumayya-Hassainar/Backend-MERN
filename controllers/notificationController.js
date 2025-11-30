const Notification = require("../models/Notification");
const User = require("../models/User");
const Vendor = require("../models/Vendor"); // if you want vendor-level notifications

// Create one notification directly (generic)
const createNotification = async (req, res) => {
  try {
    const { recipient, recipientModel, message, type } = req.body;

    const notification = await Notification.create({
      recipient,
      recipientModel,
      message,
      type,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get ALL notifications (admin only – use adminOnly middleware on route)
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate("recipient");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get notifications for logged-in user (customer/vendor/admin)
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      recipient: userId,
      // recipientModel could be "User", "Vendor" depending on how you store
      // If you always store recipientModel = "User" for all, then no need to filter by model
    })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get my notifications error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Mark one notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: req.user._id, // user can only modify his own notification
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Mark all my notifications as read
const markAllMyNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Send notification to all admins
const notifyAllAdmins = async (req, res) => {
  try {
    const { message, type } = req.body;

    const admins = await User.find({ role: "admin" });

    const notifications = await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipient: admin._id,
          recipientModel: "User",
          message,
          type: type || "System",
        })
      )
    );

    res.status(201).json({
      message: "Notifications sent to all admins",
      count: notifications.length,
    });
  } catch (error) {
    console.error("Notify all admins error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Send notification to vendor when an order is placed
// (you can call this from orderController after creating an order)
const notifyVendorOnOrder = async ({ vendorId, orderId }) => {
  try {
    await Notification.create({
      recipient: vendorId,
      recipientModel: "Vendor",
      message: `You have received a new order: ${orderId}`,
      type: "Order",
    });
  } catch (error) {
    console.error("Notify vendor on order error:", error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getMyNotifications,
  markNotificationAsRead,
  markAllMyNotificationsAsRead,
  notifyAllAdmins,
  notifyVendorOnOrder,
};
