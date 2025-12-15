const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ================= CREATE PAYMENT (COD, CARD, UPI) ================= */
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;
    const user = req.user;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "orderId, amount, and paymentMethod required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Normalize payment method
    let method = paymentMethod.toLowerCase();
    if (["card", "upi", "online"].includes(method)) method = "online"; // all online payments
    if (!["cod", "online"].includes(method)) method = "online";

    let status = method === "cod" ? "pending" : "paid";
    let transactionId = method === "cod" ? "COD" : null;

    // Online payments: create Stripe PaymentIntent
    if (method === "online") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "inr",
        metadata: { orderId: order._id.toString(), userId: user._id.toString(), method: paymentMethod },
      });
      transactionId = paymentIntent.id;
      status = "paid"; // or "processing" if you want to confirm later
    }

    const payment = await Payment.create({
      order: orderId,
      user: user._id,
      amount,
      method,
      status,
      transactionId,
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error("CreatePayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= STRIPE CHECKOUT SESSION ================= */
exports.createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "Order ID is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = order.items || order.products || []; // support different field names
    if (!items.length) {
      return res.status(400).json({ message: "Order has no items for payment" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "upi"],
      line_items: items.map(item => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name || item.productName || "Product" },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity || 1,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      customer_email: req.user.email,
      metadata: { orderId: order._id.toString() },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: "Stripe error" });
  }
};

/* ================= ADMIN GET ALL PAYMENTS ================= */
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user order");
    res.status(200).json(payments);
  } catch (err) {
    console.error("GetPayments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
