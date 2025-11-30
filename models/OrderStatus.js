const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      "Processing",
      "Packed",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ],
  },
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);

module.exports = OrderStatus;
