const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

/* =====================================================
   ✅ ADMIN – VIEW & UPDATE STATUS MASTER
===================================================== */

// Admin - Get all order statuses
exports.getAllOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatus.find().sort({ name: 1 });
    res.status(200).json(statuses);
  } catch (error) {
    console.error("Order Status Controller Error:", error);
    res.status(500).json({ message: "Failed to fetch order statuses" });
  }
};

// Admin - Update status master
exports.updateStatusMaster = async (req, res) => {
  try {
    const { name, description } = req.body;
    const update = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;

    const status = await OrderStatus.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!status)
      return res.status(404).json({ message: "Order status not found" });

    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Admin - Delete status
exports.deleteOrderStatus = async (req, res) => {
  try {
    const status = await OrderStatus.findByIdAndDelete(req.params.id);

    if (!status)
      return res.status(404).json({ message: "Order status not found" });

    res.json({ message: "Order status deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order status" });
  }
};

/* =====================================================
   ✅ VENDOR – CREATE STATUS & UPDATE ORDER STATUS
===================================================== */

// Vendor - Create new status
exports.createOrderStatusByVendor = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name)
      return res.status(400).json({ message: "Status name is required" });

    const exists = await OrderStatus.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Status already exists" });

    const status = await OrderStatus.create({
      name,
      description,
      createdBy: req.user._id,
      role: "vendor",
    });

    res.status(201).json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Vendor failed to create status" });
  }
};

// Vendor - Update real order status
exports.updateOrderStatusByVendor = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!status)
      return res.status(400).json({ message: "Status is required" });

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }

    order.orderStatus = status;
    order.trackingHistory.push({
      status,
      updatedBy: "vendor",
      updatedAt: new Date(),
    });

    await order.save();

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Vendor status update failed" });
  }
};

/* =====================================================
   ✅ CUSTOMER – LIVE ORDER TRACKING
===================================================== */

exports.getOrderStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select(
      "orderStatus trackingHistory customer"
    );

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      currentStatus: order.orderStatus,
      trackingHistory: order.trackingHistory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch order status" });
  }
};
