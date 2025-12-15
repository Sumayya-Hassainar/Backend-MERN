const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createPayment,
  createStripeSession,
  getPayments,
} = require("../controllers/paymentContoller");

const router = express.Router();

/* ================= CREATE PAYMENT ================= */
// COD or online payment (Card/UPI)
router.post("/", protect, createPayment);

/* ================= STRIPE CHECKOUT SESSION ================= */
router.post("/stripe/create-session", protect, createStripeSession);

/* ================= ADMIN GET ALL PAYMENTS ================= */
router.get("/", protect, adminOnly, getPayments);

module.exports = router;
