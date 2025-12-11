const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

// Default statuses
const DEFAULT_STATUSES = [
  { name: "Processing", description: "Order received and processing" },
  { name: "Packed", description: "Order packed and ready to ship" },
  { name: "Shipped", description: "Order is on the way" },
  { name: "Delivered", description: "Order delivered to customer" },
  { name: "Cancelled", description: "Order cancelled" },
];

/* ================= SEED DEFAULT STATUSES ================= */
async function seedDefaultStatuses(order, customer, vendor) {
  const count = await OrderStatus.countDocuments({ order: order._id });
  if (count === 0) {
    const statuses = DEFAULT_STATUSES.map((s) => ({
      ...s,
      order: order._id,
      customer: customer._id,
      createdBy: vendor._id,
      role: vendor._id ? "vendor" : "admin",
    }));
    await OrderStatus.insertMany(statuses);
  }
}

/* ================= CREATE STATUS ================= */
exports.createStatus = async (req, res) => {
  try {
    const { name, description, orderId, customerId } = req.body;

    // Only vendor/admin
    if (!["vendor", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Status name required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check duplicate status for this order
    const exists = await OrderStatus.findOne({ order: orderId, name: new RegExp(`^${name}$`, "i") });
    if (exists) return res.status(400).json({ message: "Status already exists for this order" });

    const status = await OrderStatus.create({
      name: name.trim(),
      description: description || "",
      role: req.user.role,
      createdBy: req.user._id,
      customer: customerId,
      order: orderId,
    });

    // Update main order status and tracking history
    order.orderStatus = name.trim();
    order.trackingHistory.push({
      status: name.trim(),
      updatedBy: req.user.role,
      updatedAt: new Date(),
    });
    await order.save();

    res.status(201).json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to create status" });
  }
};

/* ================= UPDATE STATUS ================= */
exports.updateStatus = async (req, res) => {
  try {
    const { name, description } = req.body;
    const status = await OrderStatus.findById(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found" });

    // Only creator or admin can update
    if (req.user.role !== "admin" && status.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (name) status.name = name.trim();
    if (description) status.description = description;

    await status.save();

    // Update main order if this is the latest status
    const order = await Order.findById(status.order);
    const last = order.trackingHistory.at(-1);
    if (last?.status === status.name) {
      order.orderStatus = status.name;
      await order.save();
    }

    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update status" });
  }
};

/* ================= DELETE STATUS ================= */
exports.deleteStatus = async (req, res) => {
  try {
    const status = await OrderStatus.findById(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found" });

    // Only creator or admin can delete
    if (req.user.role !== "admin" && status.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await OrderStatus.findByIdAndDelete(req.params.id);

    res.json({ message: "Status deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to delete status" });
  }
};

/* ================= GET STATUSES FOR ORDER ================= */
exports.getStatuses = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Vendors/admins can see their orders
    if (req.user.role === "vendor" && order.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const statuses = await OrderStatus.find({ order: req.params.orderId }).sort({ createdAt: 1 });
    res.json(statuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch statuses" });
  }
};

/* ================= CUSTOMER TRACKING ================= */
exports.getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select("orderStatus trackingHistory customer");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      currentStatus: order.orderStatus,
      history: order.trackingHistory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to fetch tracking" });
  }
};
