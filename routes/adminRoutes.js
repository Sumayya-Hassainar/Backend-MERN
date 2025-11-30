const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  getDashboard,
  getAllUsersAndVendors,
  getVendors,
  getPendingVendors,   // ✅ import
  approveVendor,
  rejectVendor,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

router.get("/dashboard", protect, adminOnly, getDashboard);
router.get("/users-vendors", protect, adminOnly, getAllUsersAndVendors);

router.get("/vendors", protect, adminOnly, getVendors);
router.get("/vendors/pending", protect, adminOnly, getPendingVendors); // ✅ matches frontend

router.patch("/vendors/:id/approve", protect, adminOnly, approveVendor);
router.patch("/vendors/:id/reject", protect, adminOnly, rejectVendor);

module.exports = router;
