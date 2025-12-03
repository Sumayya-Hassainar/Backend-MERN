// routes/VendorRoutes.js
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
router.get("/", getVendors);

// POST /api/admin/vendors        -> create new vendor
router.post("/", createVendor);

// GET /api/admin/vendors/pending -> list pending vendors
router.get("/pending", getPendingVendors);

// GET /api/admin/vendors/:id     -> single vendor
router.get("/:id", getVendorById);

// PUT /api/admin/vendors/:id     -> update vendor
router.put("/:id", updateVendor);

// DELETE /api/admin/vendors/:id  -> delete vendor
router.delete("/:id", deleteVendor);

// PATCH /api/admin/vendors/:id/approve -> approve vendor
router.patch("/:id/approve", approveVendor);

// PATCH /api/admin/vendors/:id/reject  -> reject vendor
router.patch("/:id/reject", rejectVendor);

module.exports = router;
