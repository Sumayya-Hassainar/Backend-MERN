const asyncHandler = require("express-async-handler");
const OrderStatus = require("../models/OrderStatus");

// ================= CREATE STATUS =================
const createStatus = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) {
    res.status(400);
    throw new Error("Status name is required");
  }

  const status = await OrderStatus.create({
    name: name.trim(),
    description: description || "",
    createdBy: req.user._id,
  });

  res.status(201).json({ message: "Status created", status });
});

// ================= UPDATE STATUS =================
const updateStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;
  const { name, description } = req.body;

  const status = await OrderStatus.findById(statusId);
  if (!status) {
    res.status(404);
    throw new Error("Status not found");
  }

  if (name?.trim()) status.name = name.trim();
  if (description !== undefined) status.description = description;

  await status.save();
  res.json({ message: "Status updated", status });
});

// ================= DELETE STATUS =================
const deleteStatus = asyncHandler(async (req, res) => {
  const { statusId } = req.params;

  const status = await OrderStatus.findById(statusId);
  if (!status) {
    res.status(404);
    throw new Error("Status not found");
  }

  await status.remove();
  res.json({ message: "Status deleted" });
});

// ================= GET ALL STATUSES =================
const getStatuses = asyncHandler(async (req, res) => {
  const statuses = await OrderStatus.find().sort({ createdAt: -1 });
  res.json(statuses);
});

module.exports = { createStatus, updateStatus, deleteStatus, getStatuses };
