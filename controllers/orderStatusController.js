// controllers/orderStatusCrudController.js
const OrderStatus = require("../models/OrderStatus");

// GET /api/order-status
const getAllOrderStatuses = async (req, res) => {
  try {
    const statuses = await OrderStatus.find().sort({ createdAt: 1 });
    res.json(statuses);
  } catch (error) {
    console.error("getAllOrderStatuses error:", error);
    res.status(500).json({ message: "Failed to fetch order statuses" });
  }
};

// POST /api/order-status
// body: { name, description? }
const createOrderStatus = async (req, res) => {
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
        .json({ message: `Invalid status name. Allowed: ${allowed.join(", ")}` });
    }

    const status = await OrderStatus.create({ name, description });
    res.status(201).json(status);
  } catch (error) {
    console.error("createOrderStatus error:", error);
    res.status(500).json({ message: "Failed to create order status" });
  }
};

// PUT /api/order-status/:id
const updateStatusMaster = async (req, res) => {
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

// DELETE /api/order-status/:id
const deleteOrderStatus = async (req, res) => {
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

module.exports = {
  getAllOrderStatuses,
  createOrderStatus,
  updateStatusMaster,
  deleteOrderStatus,
};
