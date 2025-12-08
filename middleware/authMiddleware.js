const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");

/* ================= AUTH PROTECT ================= */

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }

  // ✅ ALWAYS FETCH FROM DATABASE — NEVER TRUST TOKEN ROLE
  let user = await User.findById(decoded.id).select("-password");

  if (!user) {
    user = await Admin.findById(decoded.id).select("-password");
    if (user) user.role = "admin"; // ✅ force role manually
  }

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  next();
});

/* ================= ROLE GUARDS (CRASH-SAFE) ================= */

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

const vendorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "vendor") {
    return res.status(403).json({ message: "Vendor only" });
  }
  next();
};

const customerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({ message: "Customer only" });
  }
  next();
};

module.exports = {
  protect,
  adminOnly,
  vendorOnly,
  customerOnly,
};
