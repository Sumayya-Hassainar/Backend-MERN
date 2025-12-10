const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");

/* =========================================
   PROTECT MIDDLEWARE (UNIFIED)
========================================= */

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Support tokens from Header or Cookies
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }

  // Try all user collections
  let user =
    (await User.findById(decoded.id).select("-password")) ||
    (await Admin.findById(decoded.id).select("-password")) ||
    (await Vendor.findById(decoded.id).select("-password"));

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  // Assign role based on which model matched
  if (user instanceof Admin) user.role = "admin";
  else if (user instanceof Vendor) user.role = "vendor";
  else user.role = "customer";

  req.user = user;
  next();
});

/* =========================================
   ROLE GUARDS
========================================= */

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

const vendorOnly = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({ message: "Vendor only" });
  }
  next();
};

const customerOnly = (req, res, next) => {
  if (req.user.role !== "customer") {
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
