const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// In-memory OTP store
let otpStore = {}; // { email: "123456" }

// ----------------------------------------
// Generate JWT
// ----------------------------------------
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ----------------------------------------
// REGISTER (customer/vendor)
// ----------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("registerUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------
// LOGIN (Customer → OTP, Vendor/Admin → Direct login)
// ----------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    // -------------------------
    // ADMIN LOGIN → NO OTP
    // -------------------------
    const admin = await Admin.findOne({ email });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = generateToken(admin._id, "admin");

      return res.json({
        message: "Admin login successful",
        token,
        role: "admin",
        user: { _id: admin._id, name: admin.name, email: admin.email },
        redirect: "/admin/panel",
      });
    }

    // -------------------------
    // USER (Customer or Vendor)
    // -------------------------
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // -------------------------
    // VENDOR LOGIN (NO OTP)
    // -------------------------
    if (user.role === "vendor") {
      const token = generateToken(user._id, "vendor");

      return res.json({
        message: "Vendor login successful",
        token,
        role: "vendor",
        user: { _id: user._id, name: user.name, email: user.email },
        redirect: "/vendor/dashboard",
      });
    }

    // -------------------------
    // CUSTOMER LOGIN → OTP REQUIRED
    // -------------------------
    const dummyOtp = "123456";
    otpStore[email] = dummyOtp;

    console.log("Customer OTP for", email, "=", dummyOtp);

    return res.json({
      message: "OTP sent to customer",
      otpSent: true,
      email,
      role: "customer",
      redirect: "/otp",
    });

  } catch (err) {
    console.log("loginUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------
// VERIFY OTP (Customers only)
// ----------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email & OTP required" });

    if (otpStore[email] !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const user = await User.findOne({ email }).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const token = generateToken(user._id, user.role);

    return res.json({
      message: "OTP verified",
      token,
      role: user.role,
      user,
      redirect: "/products",
    });

  } catch (err) {
    console.log("verifyOtp:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------
const getProfile = async (req, res) => {
  res.json(req.user);
};

// ----------------------------------------
const logoutUser = async (req, res) => {
  res.json({ message: "Logged out" });
};

// ----------------------------------------
const checkRole = async (req, res) => {
  res.json({ role: req.user.role });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getProfile,
  logoutUser,
  checkRole,
};
