// routes/paymentRoutes.js
const express = require("express");
const {
  createCheckoutSession,
  getSessionStatus,
  getPayments,
  createPayment,     // 👈 add
} = require("../controllers/paymentContoller");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Simple / local payment record (COD or simulated)
router.post("/", protect, createPayment);  // 👈 this matches POST /api/payments

// ✅ Create Stripe Checkout Session
router.post("/create-checkout-session", protect, createCheckoutSession);

// ✅ Check Stripe session status
router.get("/session-status", protect, getSessionStatus);

// ✅ Get all payments (admin only)
router.get("/", protect, adminOnly, getPayments);

module.exports = router;
