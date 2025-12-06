const Order = require("../models/Order");

/* ================= CREATE ORDER (CUSTOMER) ================= */
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      customer: req.user._id,
      products: req.body.products,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      totalAmount: req.body.totalAmount,

      // ✅ Order starts as Pending
      orderStatus: "Pending",

      trackingHistory: [
        {
          status: "Pending",
          updatedBy: "customer",
        },
      ],
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= CUSTOMER: MY ORDERS ================= */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("products.product")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= ADMIN: ALL ORDERS ================= */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= VENDOR: MY ASSIGNED ORDERS ================= */
exports.getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({ vendor: req.user._id })
      .populate("customer", "name email")
      .populate("products.product");

    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= GET SINGLE ORDER ================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("customer", "name email")
      .populate("vendor", "name email");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= ADMIN: FORCE UPDATE STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.orderStatus = status;
    order.trackingHistory.push({
      status,
      updatedBy: "admin",
    });

    await order.save();

    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= ADMIN: ASSIGN ORDER TO VENDOR ================= */
exports.assignOrderToVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.vendor = vendorId;
    order.orderStatus = "Assigned";

    order.trackingHistory.push({
      status: "Assigned",
      updatedBy: "admin",
    });

    await order.save();

    res.json({
      message: "Vendor assigned successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Vendor assignment failed" });
  }
};

/* ================= DELETE ORDER ================= */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
