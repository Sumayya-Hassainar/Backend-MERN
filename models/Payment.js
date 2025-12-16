const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // optional
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },    // optional
    amount: { type: Number },                                        // optional
    method: { type: String, enum: ["cod", "card"] },                 // optional
    status: { type: String },                                        // optional
    transactionId: { type: String },                                  // optional
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
