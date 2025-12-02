const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,     // Step 1: send OTP
  verifyOtp,     // Step 2: verify OTP
  getProfile,
  logoutUser,
  checkRole,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// ------------------------------------------------------
// 🔹 PUBLIC AUTH ROUTES
// ------------------------------------------------------

// Customer / Vendor register
router.post("/register", registerUser);

// Login Step 1 → check password + send OTP
router.post("/login", loginUser);

// Login Step 2 → verify OTP → return token
router.post("/verify-otp", verifyOtp);

// ------------------------------------------------------
// 🔹 PROTECTED USER ROUTES (Need JWT)
// ------------------------------------------------------

// Get logged-in profile
router.get("/profile", protect, getProfile);

// Logout user
router.post("/logout", protect, logoutUser);

// Returns only { role } for redirect handling
router.get("/check-role", protect, checkRole);

// ------------------------------------------------------
module.exports = router;
