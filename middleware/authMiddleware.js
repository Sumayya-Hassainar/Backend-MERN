const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }

  let user;
  if (decoded.role === "admin") {
    user = await Admin.findById(decoded.id).select("-password");
  } else {
    user = await User.findById(decoded.id).select("-password");
  }

  if (!user) return res.status(401).json({ message: "User not found" });

  req.user = user;
  next();
});

// Role-based middlewares
const adminOnly = (req, res, next) =>
  req.user.role === "admin" ? next() : res.status(403).json({ message: "Admin only" });

const vendorOnly = (req, res, next) =>
  req.user.role === "vendor" ? next() : res.status(403).json({ message: "Vendor only" });

const customerOnly = (req, res, next) =>
  req.user.role === "customer" ? next() : res.status(403).json({ message: "Customer only" });

module.exports = { protect, adminOnly, vendorOnly, customerOnly };
