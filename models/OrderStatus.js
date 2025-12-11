const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    role: { type: String, enum: ["vendor", "admin"], default: "vendor" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderStatus", orderStatusSchema);
