const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getDashboard,
  getAllUsersAndVendors,
} = require("../controllers/adminController");

const {
  getVendors,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  createVendor,     // ✅ FROM vendorController
  updateVendor,     // ✅ FROM vendorController
  deleteVendor,     // ✅ FROM vendorController
} = require("../controllers/vendorController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// ------------------ AUTH ------------------
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// ------------------ ADMIN PROTECTED ------------------
router.use(protect, adminOnly);

router.get("/dashboard", getDashboard);
router.get("/users-vendors", getAllUsersAndVendors);

// ✅ ✅ ✅ VENDOR CRUD (ADMIN)
router.get("/vendors", getVendors);
router.post("/vendors", createVendor);          // ✅ FIXED
router.put("/vendors/:id", updateVendor);       // ✅ FIXED
router.delete("/vendors/:id", deleteVendor);    // ✅ FIXED

router.get("/vendors/pending", getPendingVendors);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);

module.exports = router;
