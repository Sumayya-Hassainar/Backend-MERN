const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

// Temporary OTP storage (DB recommended, but OK for now)
let otpStore = {};  
// Structure: otpStore[email] = { otp, expiresAt }

// ------------------------------------------------------
// Generate JWT
// ------------------------------------------------------
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ------------------------------------------------------
// REGISTER USER
// ------------------------------------------------------
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // User already exists?
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

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
    console.log("registerUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------------
// LOGIN STEP 1 → CHECK PASSWORD + SEND OTP
// ------------------------------------------------------
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // 2. Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid email or password" });

    // 3. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit

    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // valid 5 minutes
    };

    console.log("OTP:", otp);

    // 4. Send mail
    await sendEmail({
      to: email,
      subject: "Your Login OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------------
// LOGIN STEP 2 → VERIFY OTP + RETURN TOKEN
// ------------------------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check OTP exists
    if (!otpStore[email]) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    const storedOtp = otpStore[email];

    // Check OTP expire
    if (Date.now() > storedOtp.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check OTP correct?
    if (String(storedOtp.otp) !== String(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP matched → delete it
    delete otpStore[email];

    // Get user
    const user = await User.findOne({ email }).select("-password");

    const token = generateToken(user._id, user.role);

    res.json({
      message: "OTP verified successfully",
      token,
      role: user.role,
      user,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------------
// GET PROFILE
// ------------------------------------------------------
const getProfile = async (req, res) => {
  res.json(req.user);
};

// ------------------------------------------------------
// LOGOUT
// ------------------------------------------------------
const logoutUser = async (req, res) => {
  res.json({ message: "Logged out" });
};

// ------------------------------------------------------
// CHECK ROLE
// ------------------------------------------------------
const checkRole = async (req, res) => {
  res.json({ role: req.user.role });
};

// ------------------------------------------------------
// EXPORT (same style as adminVendorController)
// ------------------------------------------------------
module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  getProfile,
  logoutUser,
  checkRole,
};
