const User = require("../models/User");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ✅ GENERATE JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ==================================================
// ✅ REGISTER
// ==================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
      isFirstLogin: true,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// ✅ LOGIN
// ==================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ================= ADMIN =================
    const admin = await Admin.findOne({ email });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = generateToken(admin._id, "admin");

      return res.json({
        message: "Admin login successful",
        token,
        role: "admin",
        user: admin,
        redirect: "/admin/panel",
      });
    }

    // ================= USER =================
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    // ================= VENDOR =================
    if (user.role === "vendor") {
      const token = generateToken(user._id, "vendor");
      return res.json({
        message: "Vendor login successful",
        token,
        role: "vendor",
        user,
        redirect: "/vendor/dashboard",
      });
    }

    // ================= FIRST TIME CUSTOMER =================
    if (user.role === "customer" && user.isFirstLogin) {
      user.isFirstLogin = false;
      await user.save();

      const token = generateToken(user._id, "customer");

      return res.json({
        message: "Customer login successful",
        token,
        role: "customer",
        user,
        redirect: "/products",
      });
    }

    // ================= RETURNING CUSTOMER → OTP =================
    const otp = "123456"; // demo only
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins
    await user.save();

    console.log("LOGIN OTP:", otp);

    res.json({
      message: "OTP required",
      otpSent: true,
      email,
      role: "customer",
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// ✅ VERIFY LOGIN OTP
// ==================================================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.resetOtpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      message: "OTP verified",
      token,
      role: user.role,
      user,
      redirect: "/products",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==================================================
// ✅ FORGOT PASSWORD → SEND OTP
// ==================================================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  const otp = "123456"; // demo only
  user.resetOtp = otp;
  user.resetOtpExpiry = Date.now() + 5 * 60 * 1000;
  await user.save();

  console.log("RESET OTP:", otp);

  res.json({ message: "OTP sent to email" });
};

// ==================================================
// ✅ RESET PASSWORD
// ==================================================
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (
    !user ||
    user.resetOtp !== otp ||
    user.resetOtpExpiry < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = newPassword;
  user.resetOtp = null;
  user.resetOtpExpiry = null;
  await user.save();

  res.json({ message: "Password reset successful" });
};

// ==================================================
const getProfile = (req, res) => {
  res.json(req.user);
};

const logoutUser = (req, res) => {
  res.json({ message: "Logged out" });
};

const checkRole = (req, res) => {
  res.json({
    role: req.user.role,
    id: req.user.id,
  });
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  logoutUser,
  checkRole,
};
