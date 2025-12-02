// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,     // Step 1: check password + send OTP (for customer/vendor) OR direct admin login
  verifyOtp,     // Step 2: verify OTP -> return token (for customer/vendor)
  getProfile,
  logoutUser,
  checkRole,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// Protected
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logoutUser);
router.get("/check-role", protect, checkRole);

module.exports = router;
