// controllers/adminVendorController.js
const User = require("../models/User");

// ✅ Create Vendor (Admin only)
// payload: { name, email, password, shopName?, ... }
const createVendor = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, password, shopName } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    // check if already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // let your User model’s pre-save hook hash password
    const vendor = await User.create({
      name,
      email,
      password,
      role: "vendor",
      shopName: shopName || "",
      isVendorApproved: true, // directly approved by admin
    });

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        shopName: vendor.shopName,
        role: vendor.role,
        isVendorApproved: vendor.isVendorApproved,
      },
    });
  } catch (error) {
    console.error("createVendor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Vendors
const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    res.status(200).json(vendors);
  } catch (error) {
    console.error("getVendors error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Vendor
const getVendorById = async (req, res) => {
  try {
    const vendor = await User.findOne({
      _id: req.params.id,
      role: "vendor",
    }).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("getVendorById error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Vendor (Admin only)
const updateVendor = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = { ...req.body };
    // never allow role change from here (extra safety)
    delete updates.role;
    delete updates.password; // don’t change password from this endpoint

    const vendor = await User.findOneAndUpdate(
      { _id: req.params.id, role: "vendor" },
      updates,
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("updateVendor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Vendor (Admin only)
const deleteVendor = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vendor = await User.findOneAndDelete({
      _id: req.params.id,
      role: "vendor",
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("deleteVendor error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Already existing pending / approve / reject you had
// (I’ll keep them for your admin flow)

const getPendingVendors = async (req, res) => {
  try {
    const pending = await User.find({
      role: "vendor",
      isVendorApproved: false,
    }).select("-password");

    res.status(200).json(pending);
  } catch (error) {
    console.error("getPendingVendors error:", error);
    res.status(500).json({ message: "Failed to fetch pending vendors" });
  }
};

const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isVendorApproved = true;
    await vendor.save();

    res.status(200).json({ message: "Vendor approved", vendor });
  } catch (error) {
    console.error("approveVendor error:", error);
    res.status(500).json({ message: "Failed to approve vendor" });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // keep them as not-approved, or delete – your choice
    vendor.isVendorApproved = false;
    await vendor.save();

    res.status(200).json({ message: "Vendor rejected", vendor });
  } catch (error) {
    console.error("rejectVendor error:", error);
    res.status(500).json({ message: "Failed to reject vendor" });
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
