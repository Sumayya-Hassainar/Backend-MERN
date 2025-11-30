// controllers/accountController.js
const User = require("../models/User");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");

const getMyAccount = async (req, res) => {
  try {
    // req.user already set by protect middleware
    const { _id, role } = req.user;

    let baseProfile = null;

    if (role === "admin") {
      baseProfile = await Admin.findById(_id).select("-password");
    } else {
      baseProfile = await User.findById(_id).select("-password");
    }

    if (!baseProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    let vendorProfile = null;
    if (role === "vendor") {
      vendorProfile = await Vendor.findOne({ user: _id });
    }

    res.status(200).json({
      message: "Account fetched successfully",
      role,
      profile: baseProfile,
      vendorProfile, // null for non-vendors
    });
  } catch (err) {
    console.error("getMyAccount error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyAccount };
