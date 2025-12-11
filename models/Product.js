// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  // if you use category collection, keep ObjectId; if simple string, change to String
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    // type: String, // <- use this instead if you are storing category as string
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
  },
  stock: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },

  // 👇 IMPORTANT: multiple image URLs
  images: {
    type: [String],
    default: [],
  },

  ratingsAverage: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
