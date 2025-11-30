// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },

    // ✅ NEW: vendor approval status
    isVendorApproved: {
      type: Boolean,
      default: false, // new vendors are pending by default
    },

    // (optional) vendor extra fields
    shopName: {
      type: String,
    },
  },
  { timestamps: true }
);

// (Optional) pre-save hashing if you want
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

module.exports = mongoose.model("User", userSchema);
