const mongoose = require("mongoose");

const OrderStatusSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    status: {
      type: String,
      required: true,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["vendor", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * ✅ UNIQUE STATUS PER ORDER
 * Example:
 * Order A → "Placed" (once)
 * Order A → "Shipped" (once)
 * Order A → "Shipped" (blocked ❌)
 */
OrderStatusSchema.index(
  { order: 1, status: 1 },
  { unique: true }
);

module.exports = mongoose.model("OrderStatus", OrderStatusSchema);
