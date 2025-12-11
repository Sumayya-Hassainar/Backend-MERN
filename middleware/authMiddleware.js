// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");

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
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }

  const { id, role } = decoded;
  if (!id || !role) return res.status(401).json({ message: "Invalid token payload" });

  // Attach user record according to role
  let userDoc = null;
  if (role === "admin") userDoc = await Admin.findById(id).select("-password");
  else if (role === "vendor") userDoc = await Vendor.findById(id).select("-password");
  else userDoc = await User.findById(id).select("-password");

  if (!userDoc) return res.status(401).json({ message: "User not found" });

  // canonical req.user object for controllers (keep role)
  req.user = { ...userDoc.toObject(), role };
  next();
});

const roleGuard = (allowed = []) =>
  (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Not authenticated" });
    if (!allowed.includes(req.user.role)) return res.status(403).json({ message: "Access denied" });
    next();
  };

module.exports = {
  protect,
  adminOnly: roleGuard(["admin"]),
  vendorOnly: roleGuard(["vendor"]),
  customerOnly: roleGuard(["customer"]),
};
