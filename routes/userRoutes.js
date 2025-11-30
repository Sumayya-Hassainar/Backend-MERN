// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  checkRole,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// 🔹 Public auth routes
router.post("/register", registerUser); // customer/vendor register
router.post("/login", loginUser);       // customer/vendor/admin login

// 🔹 Protected routes (require valid JWT)
router.get("/profile", protect, getProfile);   // get logged-in user profile
router.post("/logout", protect, logoutUser);   // simple logout response
router.get("/check-role", protect, checkRole); // returns { role }

// export
module.exports = router;
