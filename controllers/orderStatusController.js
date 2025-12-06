const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

/* =====================================================
   ✅ ADMIN – STATUS MASTER CONTROL
===================================================== */

// ✅ GET all order status types
exports.getAllOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatus.find().sort({ createdAt: 1 });
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order statuses" });
  }
};

// ✅ CREATE new status
exports.createOrderStatus = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name)
      return res.status(400).json({ message: "Name is required" });

    const allowed = [
      "Pending",
      "Assigned",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];

    if (!allowed.includes(name)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowed.join(", ")}`,
      });
    }

    const status = await OrderStatus.create({ name, description });
    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({ message: "Failed to create order status" });
  }
};

// ✅ UPDATE status master
exports.updateStatusMaster = async (req, res) => {
  try {
    const { name, description } = req.body;

    const update = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;

    const status = await OrderStatus.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!status)
      return res.status(404).json({ message: "Order status not found" });

    res.json(status);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// ✅ DELETE status master
exports.deleteOrderStatus = async (req, res) => {
  try {
    const status = await OrderStatus.findByIdAndDelete(req.params.id);

    if (!status)
      return res.status(404).json({ message: "Order status not found" });

    res.json({ message: "Order status deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order status" });
  }
};

/* =====================================================
   ✅ VENDOR – UPDATE REAL ORDER STATUS
===================================================== */

exports.updateOrderStatusByVendor = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const allowedStatuses = [
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

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
    });

    await order.save();

    res.json({
      message: "Status updated successfully",
      order,
    });
  } catch (error) {
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
    res.status(500).json({ message: "Failed to fetch order status" });
  }
};
