const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'Customer', // 🔹 Helps in role-based access
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
