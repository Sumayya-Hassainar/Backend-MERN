// controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register User (customer or vendor)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, shopName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isVendor = role === "vendor";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isVendor ? "vendor" : "customer",
      shopName: isVendor ? shopName : undefined,
      // customers = true, vendors start pending
      isVendorApproved: isVendor ? false : true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVendorApproved: user.isVendorApproved,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login User (includes FIXED ADMIN login)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email & password" });
    }

    // 1) Fixed admin login via .env
    if (
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // fake admin user payload (no DB record needed)
      const adminPayload = {
        _id: "fixed-admin-id",
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      };

      const token = generateToken(adminPayload._id, adminPayload.role);

      return res.json({
        _id: adminPayload._id,
        name: adminPayload.name,
        email: adminPayload.email,
        role: adminPayload.role,
        isVendorApproved: true, // not relevant, but keep consistent
        token,
        message: "Admin login successful",
      });
    }

    // 2) Normal DB user login
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Block vendor login until approved
    if (user.role === "vendor" && !user.isVendorApproved) {
      return res.status(403).json({
        message: "Your vendor account is pending approval by admin.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVendorApproved: user.isVendorApproved,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Logout (simple for JWT)
const logoutUser = (req, res) => {
  // On frontend, just remove token from localStorage
  res.json({ message: "Logged out successfully" });
};

// Check Role
const checkRole = (req, res) => {
  res.json({ role: req.user.role });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  checkRole,
};
