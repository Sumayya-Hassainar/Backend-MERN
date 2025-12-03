const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getDashboard,
  getAllUsersAndVendors,
  getVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ------------------ Auth ------------------
// Register a new admin (optional, for setup)
router.post("/register", registerAdmin);

// Login admin
router.post("/login", loginAdmin);

// ------------------ Admin-protected routes ------------------
// All routes below require authentication + admin role
router.use(protect, adminOnly);

// Admin dashboard stats
router.get("/dashboard", getDashboard);

// List all users and vendors
router.get("/users-vendors", getAllUsersAndVendors);

// List all vendors
router.get("/vendors", getVendors);

// List pending vendors
router.get("/vendors/pending", getPendingVendors);

// Approve a vendor
router.patch("/vendors/:id/approve", approveVendor);

// Reject a vendor
router.patch("/vendors/:id/reject", rejectVendor);

module.exports = router;
