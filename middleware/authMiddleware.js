const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");

// PROTECT: verifies JWT and attaches user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: "No token provided" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Token invalid or expired" });
  }

  const { id, role } = decoded;
  if (!id || !role) return res.status(401).json({ message: "Invalid token payload" });

  let userDoc;
  switch (role) {
    case "admin":
      userDoc = await Admin.findById(id).select("-password");
      break;
    case "vendor":
      userDoc = await Vendor.findById(id).select("-password") || await User.findById(id).select("-password");
      break;
    case "customer":
      userDoc = await User.findById(id).select("-password");
      break;
    default:
      return res.status(401).json({ message: "Invalid role" });
  }

  if (!userDoc) return res.status(401).json({ message: "User not found" });

  req.user = { ...userDoc.toObject(), role };
  next();
});

// ROLE GUARD
const roleGuard = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
  next();
};

const adminOnly = roleGuard(["admin"]);
const vendorOnly = roleGuard(["vendor"]);
const customerOnly = roleGuard(["customer"]);

module.exports = { protect, adminOnly, vendorOnly, customerOnly };
