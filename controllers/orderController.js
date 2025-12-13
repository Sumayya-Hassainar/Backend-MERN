import Order from "../models/Order.js";
import User from "../models/User.js";

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    const order = await Order.create({
      ...req.body,
      customer: req.user._id,
      status: "Processing",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error); // log full error
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET MY ORDERS (Customer) ================= */
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Get My Orders Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch customer orders" });
  }
};

/* ================= GET ALL ORDERS (Admin) ================= */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Get All Orders Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

/* ================= GET VENDOR ORDERS ================= */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Vendor Orders Error:", err.message);
    return res.status(500).json({ message: "Failed to load vendor orders" });
  }
};

/* ================= GET ORDER BY ID ================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .populate("products.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ success: true, order });
  } catch (err) {
    console.error("Get Order Error:", err.message);
    return res.status(500).json({ message: "Cannot fetch order" });
  }
};

/* ================= ASSIGN ORDER TO VENDOR (Admin) ================= */
export const assignOrderToVendor = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID required" });
    }

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { vendor: vendorId },
      { new: true }
    );

    return res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Assign Error:", err.message);
    return res.status(500).json({ message: "Failed to assign vendor" });
  }
};

/* ================= DELETE ORDER (Admin) ================= */
export const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("Delete Order Error:", err.message);
    return res.status(500).json({ message: "Failed to delete order" });
  }
};
