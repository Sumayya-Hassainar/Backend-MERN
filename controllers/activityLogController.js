// controllers/activityLogController.js
const asyncHandler = require("express-async-handler");
const ActivityLog = require("../models/ActivityLog");

/**
 * GET /api/activity-logs
 * Admin: get all activity logs
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(logs);
});

/**
 * GET /api/activity-logs/:id
 * Admin: get single activity log by id
 */
const getActivityLogById = asyncHandler(async (req, res) => {
  const log = await ActivityLog.findById(req.params.id).populate(
    "user",
    "name email role"
  );

  if (!log) {
    return res.status(404).json({ message: "Activity log not found" });
  }

  res.json(log);
});

/**
 * POST /api/activity-logs
 * Admin: create a new activity log (or you can allow others too)
 */
const createActivityLog = asyncHandler(async (req, res) => {
  const { user, action, description, meta } = req.body;

  const log = await ActivityLog.create({
    user,
    action,
    description,
    meta,
  });

  res.status(201).json(log);
});

/**
 * PUT /api/activity-logs/:id
 * Admin: update an existing activity log
 */
const updateActivityLog = asyncHandler(async (req, res) => {
  const { action, description, meta } = req.body;

  const log = await ActivityLog.findById(req.params.id);

  if (!log) {
    return res.status(404).json({ message: "Activity log not found" });
  }

  if (action !== undefined) log.action = action;
  if (description !== undefined) log.description = description;
  if (meta !== undefined) log.meta = meta;

  const updated = await log.save();

  res.json(updated);
});

/**
 * DELETE /api/activity-logs/:id
 * Admin: delete a log
 */
const deleteActivityLog = asyncHandler(async (req, res) => {
  const log = await ActivityLog.findById(req.params.id);

  if (!log) {
    return res.status(404).json({ message: "Activity log not found" });
  }

  await log.deleteOne();

  res.json({ message: "Activity log removed" });
});

module.exports = {
  getActivityLogs,
  getActivityLogById,
  createActivityLog,
  updateActivityLog,
  deleteActivityLog,
};
