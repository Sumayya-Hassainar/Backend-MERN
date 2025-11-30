// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },        // e.g. "ORDER_UPDATED"
    description: { type: String },                   // text description
    meta: { type: Object },                          // extra data (optional)
  },
  { timestamps: true } // createdAt, updatedAt
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
