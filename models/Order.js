const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: String, // "admin", "vendor", "system"
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],

    totalAmount: Number,

    // ✅ CURRENT STATUS (taken from OrderStatus collection)
    status: {
      type: String,
      default: "Processing",
    },

    // ✅ FULL TRACKING
    trackingHistory: [trackingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
