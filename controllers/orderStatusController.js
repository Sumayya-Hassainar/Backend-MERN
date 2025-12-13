const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");

const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// Allowed order statuses
const enumStatuses = ["Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

exports.createStatus = asyncHandler(async (req, res) => {
  const { status, order } = req.body;

  // 1️⃣ Validate input
  if (!status || !status.trim()) return fail(res, 400, "Status is required");
  if (!order || !mongoose.Types.ObjectId.isValid(order)) return fail(res, 400, "Valid order ID is required");

  // 2️⃣ Ensure order exists
  const orderDoc = await Order.findById(order);
  if (!orderDoc) return fail(res, 404, "Order not found");

  // 3️⃣ Normalize status
  const normalizedStatus = status.trim().charAt(0).toUpperCase() + status.trim().slice(1).toLowerCase();

  // 4️⃣ Validate against allowed enum
  if (!enumStatuses.includes(normalizedStatus))
    return fail(res, 400, `Invalid status. Must be one of: ${enumStatuses.join(", ")}`);

  // 5️⃣ Prevent duplicate status for the same order
  const exists = await OrderStatus.findOne({ order, status: normalizedStatus });
  if (exists) return fail(res, 409, "This status already exists for this order");

  // 6️⃣ Create the new status
  const newStatus = await OrderStatus.create({
    order,
    status: normalizedStatus,
    createdBy: req.user._id,
    role: req.user.role,
  });

  // 7️⃣ Update the main order status
  orderDoc.status = normalizedStatus;
  await orderDoc.save();

  res.status(201).json({ success: true, status: newStatus });
});

// UPDATE STATUS
exports.updateStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;
  const { status: rawStatus } = req.body;

  if (!rawStatus || !rawStatus.trim()) return fail(res, 400, "Status is required");
  if (!mongoose.Types.ObjectId.isValid(statusId)) return fail(res, 400, "Invalid status ID");

  const statusDoc = await OrderStatus.findById(statusId);
  if (!statusDoc) return fail(res, 404, "Status not found");

  if (req.user.role === "vendor" && statusDoc.createdBy.toString() !== req.user._id.toString())
    return fail(res, 403, "Not authorized");

  const normalizedStatus = rawStatus.trim().charAt(0).toUpperCase() + rawStatus.trim().slice(1).toLowerCase();

  if (!enumStatuses.includes(normalizedStatus))
    return fail(res, 400, `Invalid status. Must be one of: ${enumStatuses.join(", ")}`);

  const exists = await OrderStatus.findOne({ order: statusDoc.order, status: normalizedStatus, _id: { $ne: statusId } });
  if (exists) return fail(res, 409, "This status already exists for this order");

  statusDoc.status = normalizedStatus;
  await statusDoc.save();
  await Order.findByIdAndUpdate(statusDoc.order, { status: normalizedStatus });

  res.json({ success: true, message: "Status updated", status: statusDoc });
});

// DELETE STATUS
exports.deleteStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(statusId)) return fail(res, 400, "Invalid status ID");

  const statusDoc = await OrderStatus.findById(statusId);
  if (!statusDoc) return fail(res, 404, "Status not found");

  if (req.user.role === "vendor" && statusDoc.createdBy.toString() !== req.user._id.toString())
    return fail(res, 403, "Not authorized");

  await statusDoc.deleteOne();
  res.json({ success: true, message: "Status deleted" });
});

// GET STATUSES BY ORDER
exports.getStatuses = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) return fail(res, 400, "Invalid order ID");

  const statuses = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });
  res.json({ success: true, statuses });
});

// CUSTOMER TRACKING
exports.getOrderTracking = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(orderId)) return fail(res, 400, "Invalid order ID");

  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) return fail(res, 404, "Order not found");

  const timeline = await OrderStatus.find({ order: orderId }).sort({ createdAt: 1 });

  res.json({ success: true, order: { _id: order._id, status: order.status }, timeline });
});
