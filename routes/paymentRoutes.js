const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createPayment,
  createStripeSession,
  stripeWebhook,
  getPayments,
} = require("../controllers/paymentContoller");

const router = express.Router();

// COD / manual payment
router.post("/", protect, createPayment);

// Stripe create session
router.post("/stripe/create-session", protect, createStripeSession);

// ⚠️ Stripe webhook — raw body required, no protect
router.post("/stripe/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Admin: get all payments
router.get("/", protect, getPayments);

module.exports = router;
