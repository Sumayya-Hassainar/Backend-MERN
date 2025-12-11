const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    role: { type: String, enum: ["vendor", "admin"], default: "vendor" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderStatus", orderStatusSchema);
