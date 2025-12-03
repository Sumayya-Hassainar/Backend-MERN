const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
});

const adminOnly = (req, res, next) => {
  req.user.role === "admin"
    ? next()
    : res.status(403).json({ message: "Admin access only" });
};

const vendorOnly = (req, res, next) => {
  req.user.role === "vendor"
    ? next()
    : res.status(403).json({ message: "Vendor access only" });
};

const customerOnly = (req, res, next) => {
  req.user.role === "customer"
    ? next()
    : res.status(403).json({ message: "Customer access only" });
};

module.exports = { protect, adminOnly, vendorOnly, customerOnly };
