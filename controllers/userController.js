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
// LOGIN STEP 1 (Admin → NO OTP)
// Existing Users → Dummy OTP
// ----------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    // ADMIN LOGIN
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
      });
    }

    // CUSTOMER / VENDOR LOGIN
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // -----------------------------
    // DUMMY OTP LOGIC
    // -----------------------------
    const dummyOtp = "123456"; // FIXED OTP
    otpStore[email] = dummyOtp;

    console.log("Dummy OTP for", email, "=", dummyOtp);

    return res.json({
      message: "OTP sent (dummy)",
      email,
      role: user.role,
      otpSent: true,
    });

  } catch (err) {
    console.log("loginUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------
// LOGIN STEP 2 → Verify OTP
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
const logoutUser = async () => {
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
