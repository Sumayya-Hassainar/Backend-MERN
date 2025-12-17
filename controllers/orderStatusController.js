const mongoose = require("mongoose");
const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");
const Vendor = require("../models/Vendor");

const FLOW = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

const normalize = (s = "") =>
  s.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/* ================= CREATE ================= */
exports.createStatus = async (req, res) => {
  const { order, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(order))
    return res.status(400).json({ message: "Invalid order ID" });

  const normalized = normalize(status);
  if (!FLOW.includes(normalized))
    return res.status(400).json({ message: "Invalid status" });

  const orderDoc = await Order.findById(order);
  if (!orderDoc) return res.status(404).json({ message: "Order not found" });

  // Vendor restriction
  if (req.user.role === "vendor") {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor)
      return res.status(403).json({ message: "Vendor not found" });

    // Only allow if order.vendor matches this vendor
    if (!orderDoc.vendor || orderDoc.vendor.toString() !== vendor._id.toString())
      return res.status(403).json({ message: "Not your order" });
  }

  const newStatus = await OrderStatus.create({
    order,
    status: normalized,
    createdBy: req.user._id,
    role: req.user.role,
  });

  res.status(201).json({ success: true, data: newStatus });
};


/* ================= UPDATE ================= */
exports.updateStatus = async (req, res) => {
  const { statusId } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(statusId))
    return res.status(400).json({ message: "Invalid status ID" });

  const statusDoc = await OrderStatus.findById(statusId);
  if (!statusDoc) return res.status(404).json({ message: "Status not found" });

  const orderDoc = await Order.findById(statusDoc.order);
  if (req.user.role === "vendor") {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || orderDoc.vendor?.toString() !== vendor._id.toString())
      return res.status(403).json({ message: "Not your order" });
  }

  statusDoc.status = normalize(status);
  await statusDoc.save();

  res.json({ success: true, data: statusDoc });
};

/* ================= DELETE ================= */
exports.deleteStatus = async (req, res) => {
  const { statusId } = req.params;

  const statusDoc = await OrderStatus.findById(statusId);
  if (!statusDoc) return res.status(404).json({ message: "Status not found" });

  await statusDoc.deleteOne();
  res.json({ success: true });
};

/* ================= GET ================= */
exports.getStatuses = async (req, res) => {
  const { orderId } = req.params;

  const statuses = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });
  res.json({ success: true, data: statuses });
};

/* ================= TRACK ================= */
exports.getOrderTracking = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  const timeline = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });
  res.json({ success: true, data: { order, timeline } });
};
