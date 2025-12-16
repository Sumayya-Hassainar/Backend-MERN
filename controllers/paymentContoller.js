const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Stripe = require("stripe");
const { v4: uuidv4 } = require("uuid");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/* ================= COD / MANUAL PAYMENT ================= */

exports. createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const paymentData = {
      order: order._id,
      user: req.user?._id || null,
      amount: amount || order.totalAmount || 0,
      method: paymentMethod || "cod",
      status: "pending",
      items: order.products || [], // attach items from order
    };

    const payment = await Payment.create(paymentData);

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
/* ================= STRIPE CHECKOUT SESSION ================= */
exports.createStripeSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findById(orderId).populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const lineItems = order.products.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.product.name,
          images: item.product.images?.length ? [item.product.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/payment/cancel`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to create Stripe session" });
  }
};

/* ================= STRIPE WEBHOOK ================= */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "Success";
      await order.save();

      await Payment.create({
        order: order._id,
        user: session.metadata.userId,
        vendor: order.vendor || null,
        amount: session.amount_total / 100,
        paymentMethod: "card",
        paymentStatus: "Success",
        transactionId: session.payment_intent,
      });
    }
  }

  res.json({ received: true });
};

/* ================= ADMIN — GET ALL PAYMENTS ================= */
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("order user vendor");
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
