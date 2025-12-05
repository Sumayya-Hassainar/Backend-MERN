const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const { notifyVendorOnOrder, notifyCustomerOnStatusUpdate } = require("./notificationController");

/* =======================================================
   ✅ CREATE ORDER (ANY LOGGED-IN USER)
======================================================= */
const createOrder = asyncHandler(async (req, res) => {
  const { products } = req.body;

  if (!products || !products.length) {
    res.status(400);
    throw new Error("No products in the order");
  }

  const order = await Order.create({
    customer: req.user._id,
    products,
    status: "Pending",
  });

  res.status(201).json(order);
});

/* =======================================================
   ✅ ASSIGN ORDER TO VENDOR (ADMIN ONLY)
======================================================= */
const assignOrderToVendor = asyncHandler(async (req, res) => {
  const { orderId, vendorId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.vendor = vendorId;
  await order.save();

  // Notify vendor
  await notifyVendorOnOrder({ vendorId, orderId: order._id });

  res.status(200).json(order);
});

/* =======================================================
   ✅ UPDATE ORDER STATUS (VENDOR / ADMIN)
======================================================= */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  await order.save();

  // Notify customer
  await notifyCustomerOnStatusUpdate({ customerId: order.customer, status, orderId: order._id });

  res.status(200).json(order);
});

/* =======================================================
   ✅ GET ALL ORDERS (ADMIN)
======================================================= */
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("customer", "-password")
    .populate("vendor", "-password")
    .populate("products.product");

  res.status(200).json(orders);
});

/* =======================================================
   ✅ GET SINGLE ORDER BY ID (ADMIN OR CUSTOMER)
======================================================= */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id)
    .populate("customer", "-password")
    .populate("vendor", "-password")
    .populate("products.product");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Only admin or the customer can see this order
  if (req.user.role !== "admin" && order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.status(200).json(order);
});

/* =======================================================
   ✅ GET LOGGED-IN CUSTOMER'S ORDERS
======================================================= */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("products.product")
    .populate("vendor", "-password");

  res.status(200).json(orders);
});

/* =======================================================
   ✅ GET LOGGED-IN VENDOR'S ORDERS
======================================================= */
const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ vendor: req.user._id })
    .sort({ createdAt: -1 })
    .populate("products.product")
    .populate("customer", "-password");

  res.status(200).json(orders);
});

/* =======================================================
   ✅ DELETE ORDER (ADMIN ONLY)
======================================================= */
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.status(200).json({ message: "Order deleted successfully" });
});

module.exports = {
  createOrder,
  assignOrderToVendor,
  updateOrderStatus,
  getOrders,
  getOrderById,
  getMyOrders,
  getVendorOrders,
  deleteOrder,
};
