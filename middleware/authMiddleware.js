// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Admin = require("../models/Admin");

// 🔹 Protect route & attach user/admin to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user;
      // Check role to fetch from correct model
      if (decoded.role === "admin") {
        user = await Admin.findById(decoded.id).select("-password");
      } else {
        user = await User.findById(decoded.id).select("-password");
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // attach to request
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

// 🔹 Role-based access
const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

const vendorOnly = (req, res, next) => {
  if (req.user?.role === "vendor") return next();
  return res.status(403).json({ message: "Vendor access only" });
};

const customerOnly = (req, res, next) => {
  if (req.user?.role === "customer") return next();
  return res.status(403).json({ message: "Customer access only" });
};

module.exports = { protect, adminOnly, vendorOnly, customerOnly };
