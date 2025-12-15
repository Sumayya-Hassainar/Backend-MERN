const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

/* ================= CREATE ORDER ================= */
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!products?.length) {
      return res.status(400).json({ message: "No products in order" });
    }

    const order = await Order.create({
      user: req.user._id,
      products,
      shippingAddress,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Initiated",
    });

    // 🔑 CONTRACT IS CLEAR
    res.status(201).json({
      success: true,
      order, // frontend MUST read order._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ================= GET MY ORDERS (Customer) ================= */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("vendor", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get My Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch customer orders" });
  }
};

/* ================= GET ALL ORDERS (Admin) ================= */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

/* ================= GET VENDOR ORDERS ================= */
const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user._id })
      .populate("customer", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Get Vendor Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ORDER BY ID ================= */
const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Get Order Error:", err);
    res.status(500).json({ message: "Cannot fetch order" });
  }
};

/* ================= ASSIGN ORDER TO VENDOR (Admin) ================= */
const assignOrderToVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const { orderId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { vendor: vendorId },
      { new: true }
    ).populate("vendor", "name email");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 notify vendor & admin panels
    req.io.emit("orderVendorAssigned", {
      orderId: updatedOrder._id.toString(),
      vendor: updatedOrder.vendor,
    });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Assign Order Error:", err);
    res.status(500).json({ message: "Failed to assign vendor" });
  }
};

/* ================= DELETE ORDER (Admin) ================= */
const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getVendorOrders,
  getOrderById,
  assignOrderToVendor,
  deleteOrder,
};
