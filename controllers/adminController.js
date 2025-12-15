// controllers/adminController.js
const Admin = require("../models/Admin");
const User = require("../models/User"); // vendors are just users with role: "vendor"
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Admin Registration (optional for setup)
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    console.error("registerAdmin error:", error);
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" }, // ✅ lowercase "admin"
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Admin Dashboard Data (example stats)
const getDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "customer" });
    const vendorCount = await User.countDocuments({ role: "vendor" });
    const adminCount = await Admin.countDocuments();

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      stats: { userCount, vendorCount, adminCount },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get All Users and Vendors
const getAllUsersAndVendors = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" }).select("-password");
    const vendors = await User.find({ role: "vendor" }).select("-password");

    res.status(200).json({ users, vendors });
  } catch (error) {
    console.error("getAllUsersAndVendors error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get all vendors (for admin vendor list)
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.status(200).json(vendors);
  } catch (error) {
    console.error("getVendors error:", error);
    res.status(500).json({ message: "Failed to fetch vendors" });
  }
};

// 🔹 Get pending vendors (for /admin/vendors/pending)
const getPendingVendors = async (req, res) => {
  try {
    const pending = await User.find({
      role: "vendor",
      isVendorApproved: false,
    }).select("-password");

    res.status(200).json(pending);
  } catch (error) {
    console.error("getPendingVendors error:", error);
    res.status(500).json({ message: "Failed to fetch pending vendors" });
  }
};

// 🔹 Approve vendor
const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isVendorApproved = true;
    await vendor.save();

    res.status(200).json({ message: "Vendor approved", vendor });
  } catch (error) {
    console.error("approveVendor error:", error);
    res.status(500).json({ message: "Failed to approve vendor" });
  }
};

// 🔹 Reject vendor
const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Option 1: keep them as vendor but not approved
    vendor.isVendorApproved = false;
    await vendor.save();

    // Option 2 (alternative): delete them completely
    // await vendor.deleteOne();

    res.status(200).json({ message: "Vendor rejected", vendor });
  } catch (error) {
    console.error("rejectVendor error:", error);
    res.status(500).json({ message: "Failed to reject vendor" });
  }
};
/* ================= GET ALL USERS ================= */
const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password -otp -otpExpiry")
    .sort({ createdAt: -1 });

  res.json(users);
};

/* ================= BLOCK / UNBLOCK USER ================= */
const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isBlocked } = req.body;

  if (typeof isBlocked !== "boolean") {
    return res.status(400).json({ message: "isBlocked must be boolean" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isBlocked = isBlocked;
  await user.save();

  res.json({
    message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
    userId: user._id,
    isBlocked: user.isBlocked,
  });
};

/* ================= CHANGE USER ROLE ================= */
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["customer", "vendor"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent admin downgrade/upgrade mistakes
  if (user.role === "admin") {
    return res.status(403).json({ message: "Cannot modify admin role" });
  }

  user.role = role;
  await user.save();

  res.json({
    message: "User role updated",
    userId: user._id,
    role: user.role,
  });
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getDashboard,
  getAllUsersAndVendors,
  getVendors,
  getPendingVendors,   // ✅ added
  approveVendor,
  rejectVendor,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
};
