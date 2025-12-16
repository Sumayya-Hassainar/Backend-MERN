const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true, enum: ["cod", "card"] },
  status: { type: String,  },
  transactionId: { 
    type: String, 
    required: function() { return this.method !== "cod"; } // required only for card
  },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
