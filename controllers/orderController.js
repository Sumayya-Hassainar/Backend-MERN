const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const User = require("../models/User");

// ================= CREATE ORDER =================
const createOrder = asyncHandler(async (req, res) => {
  const order = await Order.create({
    ...req.body,
    customer: req.user._id,
    status: "Processing",
  });
  res.status(201).json(order);
});

// ================= GET MY ORDERS (Customer) =================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("products.product", "title price image")
      .populate("vendor", "shopName email")
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("My Orders Error:", error);
    res.status(500).json({ message: "Failed to load orders" });
  }
};


// ================= GET VENDOR ORDERS =================
const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const orders = await Order.find({ vendor: vendorId }).populate("customer products.product");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ADMIN GET ALL ORDERS =================
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("customer vendor", "name email");
  res.json(orders);
});

// ================= GET SINGLE ORDER =================
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customer vendor",
    "name email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json(order);
});

// ================= ASSIGN VENDOR (ADMIN) =================
const assignOrderToVendor = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { vendorId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const vendor = await User.findById(vendorId);
  if (!vendor || vendor.role !== "vendor") {
    res.status(400);
    throw new Error("Invalid vendor ID");
  }

  order.vendor = vendorId;
  order.status = "Assigned"; // automatically mark as Assigned
  await order.save();

  res.json({ message: "Vendor assigned", order });
});

// ================= DELETE ORDER (ADMIN) =================
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  await order.remove();
  res.json({ message: "Order deleted" });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getVendorOrders,
  getOrderById,
  assignOrderToVendor,
  deleteOrder,
};
