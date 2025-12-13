/**
 * Run this script once to fix MongoDB duplicate key errors for OrderStatus.
 * Usage: node cleanOrderStatus.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI; // Ensure this is correct in your .env

const orderStatusSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order",  },
  status: { type: String, },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
  role: { type: String, enum: ["vendor", "admin"]},
}, { timestamps: true });

// Compound unique index: one status per order
orderStatusSchema.index({ order: 1, status: 1 }, { unique: true });
module.exports = mongoose.model("OrderStatus", orderStatusSchema);

