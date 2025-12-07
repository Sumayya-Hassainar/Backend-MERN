const Order = require("../models/Order");

/* ================= CREATE ORDER (CUSTOMER) ================= */
exports.createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    // ✅ AUTO-ASSIGN VENDOR FROM FIRST PRODUCT
    const assignedVendor = products[0].vendor;

    const order = await Order.create({
      customer: req.user._id,
      vendor: assignedVendor, // ✅✅✅ THIS IS THE FIX
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,

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



/* ================= ADMIN: ASSIGN ORDER TO VENDOR ================= */
exports.assignOrderToVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;
    const { orderId } = req.params;

    if (!vendorId) {
      return res.status(400).json({ message: "vendorId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.vendor = vendorId; //✅✅ THIS IS WHAT YOUR VENDOR QUERY NEEDS
    order.orderStatus = "Assigned";

    order.trackingHistory.push({
      status: "Assigned",
      updatedBy: "admin",
    });

    await order.save();

    res.status(200).json({
      message: "Vendor assigned successfully",
      order,
    });
  } catch (error) {
    console.error("ASSIGN ERROR:", error);
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
