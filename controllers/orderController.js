const Order = require("../models/Order");

/* ================= CREATE ORDER (Customer) ================= */
exports.createOrder = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body); // <--- log incoming data
    const order = await Order.create(req.body);
    return res.json({ success: true, order });
  } catch (err) {
    console.error("Create Order Error:", err); // <--- log actual error
    return res.status(500).json({ message: "Failed to create order" });
  }
};

/* ================= GET MY ORDERS (Customer) ================= */
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Get My Orders Error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= GET ALL ORDERS (Admin) ================= */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("vendor", "name")
      .sort({ createdAt: -1 });

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Get All Orders Error:", err);
    return res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

/* ================= GET VENDOR ORDERS ================= */
exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Vendor Orders Error:", err);
    return res.status(500).json({ message: "Failed to load vendor orders" });
  }
};

/* ================= GET ORDER BY ID ================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("vendor", "name");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("Get Order Error:", err);
    return res.status(500).json({ message: "Cannot fetch order" });
  }
};

/* ================= ASSIGN ORDER TO VENDOR (Admin) ================= */
exports.assignOrderToVendor = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { vendorId } = req.body;

    if (!vendorId)
      return res.status(400).json({ message: "Vendor ID required" });

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { vendor: vendorId },
      { new: true }
    );

    return res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Assign Error:", err);
    return res.status(500).json({ message: "Failed to assign vendor" });
  }
};

/* ================= DELETE ORDER (Admin) ================= */
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    return res.status(500).json({ message: "Failed to delete order" });
  }
};
