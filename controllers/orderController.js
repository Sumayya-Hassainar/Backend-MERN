const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Vendor =require("../models/Vendor")

/* ================= CREATE ORDER ================= */
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, totalAmount, paymentMethod } = req.body;

    if (!products?.length) {
      return res.status(400).json({ message: "No products in order" });
    }

    // Ensure product IDs are valid
    const validProducts = products.map((p) => ({
      product: p.product,
      quantity: p.quantity,
      price: p.price,
    }));

    const order = await Order.create({
      customer: req.user._id,
      products: validProducts,
      shippingAddress,
      totalAmount,
      paymentMethod,
      status: "Processing",
    });

    // populate before sending to frontend
    const populatedOrder = await Order.findById(order._id)
      .populate("products.product", "name price images")
      .populate("customer", "name email")
      .lean();

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET MY ORDERS (Customer) ================= */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("products.product", "name price images")
      .populate("vendor", "name email")
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
    // 1️⃣ Find vendor linked to logged-in user
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // 2️⃣ Fetch orders ASSIGNED to this vendor
    const orders = await Order.find({ vendor: vendor._id })
      .populate("customer", "name email")
      .populate("products.product", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Vendor orders error:", err);
    res.status(500).json({ message: "Failed to fetch vendor orders" });
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
      .populate("products.product", "name price images")
      .lean();

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
  console.log("🔥 ASSIGN CONTROLLER START");

  try {
    const { vendorId } = req.body;
    const { orderId } = req.params;

    console.log("Received:", { orderId, vendorId });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }
    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ message: "Invalid vendorId" });
    }

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    // Update order with vendor
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { vendor: vendorId },
      { new: true }
    ).populate("vendor", "name shopName email");

    if (!updatedOrder) {
      console.log("❌ Order not found for ID:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ ORDER UPDATED:", !!updatedOrder);

    // Emit socket event safely
    if (req.io) {
      req.io.emit("orderVendorAssigned", {
        orderId: updatedOrder._id.toString(),
        vendor: updatedOrder.vendor,
      });
      console.log("📡 SOCKET EMITTED");
    } else {
      console.log("⚠️ req.io not found, skipping socket emit");
    }

    // Send success response
    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });

  } catch (err) {
    console.error("❌ ASSIGN ERROR:", err);
    return res.status(500).json({ message: "Failed to assign vendor" });
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
