// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "upi", "stripe"],
      default: "cod",
    },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingStatus: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
