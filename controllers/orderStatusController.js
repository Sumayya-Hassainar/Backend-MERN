const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

const {
  notifyCustomerOnStatusUpdate,
} = require("./notificationController");

/* =====================================================
   ✅ ADMIN – STATUS MASTER CONTROL
===================================================== */

// ✅ GET all order status types
exports.getAllOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatus.find().sort({ createdAt: 1 });
    res.json(statuses);
  } catch (error) {
    console.error("getAllOrderStatuses error:", error);
    res.status(500).json({ message: "Failed to fetch order statuses" });
  }
};

// ✅ CREATE new status
exports.createOrderStatus = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const allowed = [
      "Processing",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ];

    if (!allowed.includes(name)) {
      return res
        .status(400)
        .json({ message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }

    const status = await OrderStatus.create({ name, description });
    res.status(201).json(status);
  } catch (error) {
    console.error("createOrderStatus error:", error);
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

    if (!status) {
      return res.status(404).json({ message: "Order status not found" });
    }

    res.json(status);
  } catch (error) {
    console.error("updateStatusMaster error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// ✅ DELETE status master
exports.deleteOrderStatus = async (req, res) => {
  try {
    const status = await OrderStatus.findByIdAndDelete(req.params.id);

    if (!status) {
      return res.status(404).json({ message: "Order status not found" });
    }

    res.json({ message: "Order status deleted successfully" });
  } catch (error) {
    console.error("deleteOrderStatus error:", error);
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

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Vendor can only update their assigned order
    if (order.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    order.orderStatus = status;
    await order.save();

    // 🔔 Notify customer
    await notifyCustomerOnStatusUpdate({
      customerId: order.customer,
      status,
      orderId: order._id,
    });

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("updateOrderStatusByVendor error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

/* =====================================================
   ✅ CUSTOMER – VIEW LIVE ORDER STATUS
===================================================== */

exports.getOrderStatusByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select("orderStatus");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Customer can only see their order
    if (order.customer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ orderStatus: order.orderStatus });
  } catch (error) {
    console.error("getOrderStatusByOrderId error:", error);
    res.status(500).json({ message: "Failed to fetch order status" });
  }
};
