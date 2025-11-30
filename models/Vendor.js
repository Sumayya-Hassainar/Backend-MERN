const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shopName: { type: String, required: true },
  description: String,
  gstNumber: String,
  address: String,
  logo: String,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String,
  },
  rating: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  complianceVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
