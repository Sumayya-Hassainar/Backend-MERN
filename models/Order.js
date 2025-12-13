const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional now

    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product"},
        quantity: { type: Number },
        price: { type: Number },
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

    status: {
      type: String,
      default: "Processing",
      enum: ["Processing", "Assigned", "Shipped", "Delivered", "Cancelled"],
    },

    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "cod" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
