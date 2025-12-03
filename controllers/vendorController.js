const Vendor = require("../models/Vendor");
const User = require("../models/User");

// ===============================
// CREATE VENDOR (Admin)
// ===============================
const createVendor = async (req, res) => {
  try {
    const { userId, shopName, description, gstNumber, address, logo } = req.body;

    if (!userId || !shopName) {
      return res.status(400).json({ message: "userId & shopName are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = await Vendor.findOne({ user: userId });
    if (exists) return res.status(400).json({ message: "Vendor already exists" });

    const vendor = await Vendor.create({
      user: userId,
      shopName,
      description,
      gstNumber,
      address,
      logo,
      complianceVerified: false, // pending initially
    });

    res.status(201).json({ message: "Vendor created", vendor });
  } catch (err) {
    console.error("createVendor", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET ALL VENDORS
// ===============================
const getVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate("user", "-password");
    res.status(200).json(vendors);
  } catch (err) {
    console.error("getVendors", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET SINGLE VENDOR
// ===============================
const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).populate("user", "-password");
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json(vendor);
  } catch (err) {
    console.error("getVendorById", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// UPDATE VENDOR
// ===============================
const updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("user", "-password");

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({ message: "Vendor updated", vendor });
  } catch (err) {
    console.error("updateVendor", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// DELETE VENDOR
// ===============================
const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json({ message: "Vendor deleted" });
  } catch (err) {
    console.error("deleteVendor", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// GET PENDING VENDORS
// ===============================
const getPendingVendors = async (req, res) => {
  try {
    const pending = await Vendor.find({ complianceVerified: false })
      .populate("user", "-password");

    res.json(pending);
  } catch (err) {
    console.error("getPendingVendors", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// APPROVE VENDOR
// ===============================
const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.complianceVerified = true;
    await vendor.save();

    res.json({ message: "Vendor Approved", vendor });
  } catch (err) {
    console.error("approveVendor", err);
    res.status(500).json({ message: err.message });
  }
};

// ===============================
// REJECT VENDOR
// ===============================
const rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.complianceVerified = false;
    await vendor.save();

    res.json({ message: "Vendor Rejected", vendor });
  } catch (err) {
    console.error("rejectVendor", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getPendingVendors,
  approveVendor,
  rejectVendor,
};
