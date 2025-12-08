const express = require("express");
const router = express.Router();

// ✅ CONTROLLER IMPORT
const {
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
  checkRole,
} = require("../controllers/userController");

// ✅ AUTH MIDDLEWARE
const { protect } = require("../middleware/authMiddleware");

// ==================================================
// ✅ PUBLIC ROUTES
// ==================================================
router.post("/register", registerUser);        // Register
router.post("/login", loginUser);             // Login
router.post("/verify-otp", verifyOtp);        // Login OTP
router.post("/forgot-password", forgotPassword); // Forgot password
router.post("/reset-password", resetPassword);   // Reset password

// ==================================================
// ✅ PROTECTED ROUTES
// ==================================================
router.get("/profile", protect, getProfile);  
router.post("/logout", protect, logoutUser);
router.get("/check-role", protect, checkRole);

module.exports = router;
