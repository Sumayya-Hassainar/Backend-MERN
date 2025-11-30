// routes/adminVendorRoutes.js
const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getPendingVendors,
  approveVendor,
  rejectVendor,
} = require("../controllers/vendorController");

// All these routes are admin-only
router.use(protect, adminOnly);

// GET /api/admin/vendors         -> list all vendors
router.get("/vendors", getVendors);

// POST /api/admin/vendors        -> create new vendor
router.post("/vendors", createVendor);

// GET /api/admin/vendors/pending -> list pending vendors
router.get("/vendors/pending", getPendingVendors);

// GET /api/admin/vendors/:id     -> single vendor
router.get("/vendors/:id", getVendorById);

// PUT /api/admin/vendors/:id     -> update vendor
router.put("/vendors/:id", updateVendor);

// DELETE /api/admin/vendors/:id  -> delete vendor
router.delete("/vendors/:id", deleteVendor);

// PATCH /api/admin/vendors/:id/approve -> approve vendor
router.patch("/vendors/:id/approve", approveVendor);

// PATCH /api/admin/vendors/:id/reject  -> reject vendor
router.patch("/vendors/:id/reject", rejectVendor);

module.exports = router;
