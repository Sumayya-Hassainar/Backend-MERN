// controllers/orderController.js
const Order = require("../models/Order");

// ---------- CREATE ORDER (customer checkout) ----------
const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized, no customer" });
    }

    const {
      products,          // [{ product, quantity, price }]
      shippingAddress,   // { fullName, phone, street, city, state, country, pincode }
      paymentMethod,     // "cod" | "card" | ...
      totalAmount,
      orderStatus,
    } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products in order" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    const orderData = {
      customer: req.user._id,
      products,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod || "cod",
      totalAmount,
      orderStatus: orderStatus || "Pending",
    };

    const order = await Order.create(orderData);
    return res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ---------- GET ALL ORDERS (admin only) ----------
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("products.product", "name price images"); // ✅ no vendor

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ---------- GET MY ORDERS (logged-in customer) ----------
const getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id;

    const orders = await Order.find({ customer: userId })
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ---------- GET SINGLE ORDER (customer / admin) ----------
const getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate("customer", "name email")
      .populate("products.product", "name price images"); // ✅ no vendor

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only owner or admin can see it
    if (
      req.user.role !== "admin" &&
      order.customer &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Get single order error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ---------- UPDATE ORDER STATUS (admin) ----------
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ message: "orderStatus is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(400).json({ message: error.message });
  }
};

// ---------- DELETE ORDER (admin) ----------
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    console.error("Delete order error:", error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getSingleOrder,      // ✅ export added
  updateOrderStatus,
  deleteOrder,
};
