const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  // ❌ order is now OPTIONAL (or remove it completely if you don't need it)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: false,
  },

  // optional vendor
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  amount: {
    type: Number,
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["cod", "card"],   // ✅ must match what frontend sends
    required: true,
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
  },

  transactionId: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
