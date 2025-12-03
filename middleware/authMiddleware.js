const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message:  "user not found "});
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access only" });
};

const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === "vendor") return next();
  return res.status(403).json({ message: "Vendor access only" });
};

const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === "customer") return next();
  return res.status(403).json({ message: "Customer access only" });
};

module.exports = { protect, adminOnly, vendorOnly, customerOnly };
