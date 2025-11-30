const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, refPath: "recipientModel" },
  recipientModel: { type: String, enum: ["User", "Vendor", "Admin"] },
  message: String,
  type: { type: String, enum: ["Order", "Payment", "System", "Dispute"] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
