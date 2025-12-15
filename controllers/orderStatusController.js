// controllers/orderStatusController.js
const mongoose = require("mongoose");
const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

/* ================= STATUS FLOW ================= */
const FLOW = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

/* ================= NORMALIZE STATUS ================= */
const normalize = (s) => {
  if (!s) return "";
  return s.trim()
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/* ================= SOCKET BROADCAST ================= */
const broadcast = async (req, orderId) => {
  const timeline = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });
  const latest = timeline[timeline.length - 1]?.status || "Pending";

  await Order.findByIdAndUpdate(orderId, { orderStatus: latest });

  if (req.io) {
    req.io.to(`order:${orderId}`).emit("orderStatusUpdated", {
      orderId,
      status: latest,
      timeline,
    });
  }
};

/* ================= CREATE STATUS ================= */
exports.createStatus = async (req, res) => {
  try {
    const { order, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(order)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const normalized = normalize(status);
    if (!FLOW.includes(normalized)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const orderDoc = await Order.findById(order);
    if (!orderDoc) return res.status(404).json({ success: false, message: "Order not found" });

    // Vendor ownership check
    if (req.user.role === "vendor" && (!orderDoc.vendor || orderDoc.vendor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    // Create status
    const newStatus = await OrderStatus.create({
      order,
      status: normalized,
      createdBy: req.user._id,
      role: req.user.role,
    });

    await broadcast(req, order);

    res.status(201).json({ success: true, data: { status: newStatus } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Status already exists for this order" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE STATUS ================= */
exports.updateStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ success: false, message: "Invalid status ID" });
    }

    const normalized = normalize(status);
    if (!FLOW.includes(normalized)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const statusDoc = await OrderStatus.findById(statusId);
    if (!statusDoc) return res.status(404).json({ success: false, message: "Status not found" });

    // Vendor ownership check
    const orderDoc = await Order.findById(statusDoc.order);
    if (req.user.role === "vendor" && (!orderDoc.vendor || orderDoc.vendor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    statusDoc.status = normalized;
    await statusDoc.save();

    await broadcast(req, statusDoc.order);

    res.json({ success: true, data: { status: statusDoc } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Status already exists for this order" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE STATUS ================= */
exports.deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({ success: false, message: "Invalid status ID" });
    }

    const statusDoc = await OrderStatus.findById(statusId);
    if (!statusDoc) return res.status(404).json({ success: false, message: "Status not found" });

    const orderDoc = await Order.findById(statusDoc.order);
    if (req.user.role === "vendor" && (!orderDoc.vendor || orderDoc.vendor.toString() !== req.user._id.toString())) {
      return res.status(403).json({ success: false, message: "Not your order" });
    }

    await statusDoc.remove();
    await broadcast(req, statusDoc.order);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET STATUSES FOR VENDOR ================= */
exports.getStatuses = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const statuses = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });
    res.json({ success: true, data: { statuses } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= CUSTOMER ORDER TRACKING ================= */
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: orderId, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const timeline = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderStatus: order.orderStatus,
        },
        timeline,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
