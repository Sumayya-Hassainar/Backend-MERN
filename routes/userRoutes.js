const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyOtp,
  getProfile,
  logoutUser,
  checkRole,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

router.get("/profile", protect, getProfile);
router.post("/logout", protect, logoutUser);
router.get("/check-role", protect, checkRole);

module.exports = router;
