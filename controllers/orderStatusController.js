const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

/* ================= CREATE STATUS (Vendor Only) ================= */
exports.createStatus = async (req, res) => {
  try {
    const { orderId, status, description } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ message: "orderId and status are required" });
    }

    // Ensure the vendor owns the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newStatus = await OrderStatus.create({
      order: orderId,
      status,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, status: newStatus });
  } catch (err) {
    console.error("Create Status Error:", err);
    res.status(500).json({ message: "Failed to create status" });
  }
};

/* ================= UPDATE STATUS (Vendor Only) ================= */
exports.updateStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { status, description } = req.body;

    const existing = await OrderStatus.findById(statusId);
    if (!existing) return res.status(404).json({ message: "Status not found" });

    if (existing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    existing.status = status || existing.status;
    existing.description = description || existing.description;
    await existing.save();

    res.json({ success: true, status: existing });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ================= DELETE STATUS (Vendor Only) ================= */
exports.deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    const existing = await OrderStatus.findById(statusId);
    if (!existing) return res.status(404).json({ message: "Status not found" });

    if (existing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await OrderStatus.findByIdAndDelete(statusId);
    res.json({ success: true, message: "Status deleted" });
  } catch (err) {
    console.error("Delete Status Error:", err);
    res.status(500).json({ message: "Failed to delete status" });
  }
};

/* ================= GET STATUSES FOR ORDER (Universal) ================= */
exports.getStatuses = async (req, res) => {
  try {
    const { orderId } = req.params;

    const statuses = await OrderStatus.find({ order: orderId })
      .sort({ createdAt: 1 })
      .populate("createdBy", "name email");

    res.json({ success: true, statuses });
  } catch (err) {
    console.error("Get Statuses Error:", err);
    res.status(500).json({ message: "Failed to fetch statuses" });
  }
};

/* ================= CUSTOMER TRACKING ================= */
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const statuses = await OrderStatus.find({ order: orderId })
      .sort({ createdAt: 1 })
      .populate("createdBy", "name");

    res.json({ success: true, order: order, statuses });
  } catch (err) {
    console.error("Get Order Tracking Error:", err);
    res.status(500).json({ message: "Failed to fetch tracking info" });
  }
};
