// controllers/userController.js
const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// In-memory OTP store
let otpStore = {}; // { email: "123456" }

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ==================================================
// REGISTER USER
// ==================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "customer",
      isFirstLogin: true, // important
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// LOGIN USER
// ==================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    // 1. ---- ADMIN LOGIN ----
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
        user: { _id: admin._id, email: admin.email },
        redirect: "/admin/panel",
      });
    }

    // 2. ---- NORMAL USER (CUSTOMER / VENDOR) ----
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // -----------------------------
    // VENDOR → DIRECT LOGIN
    // -----------------------------
    if (user.role === "vendor") {
      const token = generateToken(user._id, "vendor");

      return res.json({
        message: "Vendor login successful",
        token,
        role: "vendor",
        user: { _id: user._id, email: user.email },
        redirect: "/vendor/dashboard",
      });
    }

    // -----------------------------
    // CUSTOMER FIRST LOGIN → NO OTP
    // -----------------------------
    if (user.role === "customer" && user.isFirstLogin === true) {
      user.isFirstLogin = false;
      await user.save();

      const token = generateToken(user._id, "customer");

      return res.json({
        message: "Customer first login successful",
        token,
        role: "customer",
        user: { _id: user._id, email: user.email },
        redirect: "/products",
      });
    }

    // -----------------------------
    // CUSTOMER RETURNING LOGIN → OTP
    // -----------------------------
    const dummyOtp = "123456";
    otpStore[email] = dummyOtp;

    console.log("OTP for", email, "=", dummyOtp);

    return res.json({
      message: "OTP required",
      otpSent: true,
      email,
      role: "customer",
      redirect: "/otp",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// VERIFY OTP
// ==================================================
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
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
const getProfile = (req, res) => {
  res.json(req.user);
};

const logoutUser = (req, res) => {
  res.json({ message: "Logged out" });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getProfile,
  logoutUser,
};
