 controllers/userController.js
const User = require("../models/User");
const Admin = require("../models/Admin");
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
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    // 1) check for admin first
    const admin = await Admin.findOne({ email });
    if (admin) {
      // admin login: validate password and directly return token (no OTP)
      const matchAdmin = await bcrypt.compare(password, admin.password);
      if (!matchAdmin) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const token = generateToken(admin._id, "admin");
      return res.status(200).json({
        message: "Admin login successful",
        token,
        role: "admin",
        user: { _id: admin._id, name: admin.name, email: admin.email },
      });
    }

    // 2) Not admin → find user (customer/vendor)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // OK password for customer/vendor — generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // send OTP by email
    try {
      await sendEmail({
        to: email,
        subject: "Your login OTP",
        text: `Your login OTP is ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your login OTP is <b>${otp}</b>. It is valid for 5 minutes.</p>`,
      });
    } catch (sendErr) {
      console.error("Error sending OTP email:", sendErr);
      // delete otp if email failed
      delete otpStore[email];
      return res
        .status(500)
        .json({ message: "Failed to send OTP email. Try again later." });
    }

    // Respond telling frontend to ask for OTP
    return res.status(200).json({
      message: "OTP sent to your email",
      email,
      role: user.role,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("loginUser error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------------------------------
// LOGIN STEP 2 → VERIFY OTP -> RETURN TOKEN
// ------------------------------------------------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const stored = otpStore[email];
    if (!stored) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(stored.otp) !== String(otp)) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP valid -> remove it
    delete otpStore[email];

    // find the user
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
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
