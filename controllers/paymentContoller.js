// controllers/paymentController.js
const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const client_domain = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * SIMPLE PAYMENT CREATION
 * Used by your PaymentPage for COD / simple online payment record
 * POST /api/payments
 */
// controllers/paymentController.js
const createPayment = async (req, res) => {
  try {
    const { order, vendor, amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "amount and paymentMethod are required" });
    }

    const userId = req.user ? req.user._id : null;

    // ✅ normalize status to match enum
    let paymentStatus;
    if (paymentMethod === "cod") {
      paymentStatus = "Pending";      // 👈 capital P
    } else if (paymentMethod === "card") {
      paymentStatus = "Success";      // 👈 capital S
    } else {
      paymentStatus = "Failed";
    }

    const payment = await Payment.create({
      order: order || null,
      vendor: vendor || null,
      user: userId,
      amount,
      paymentMethod,   // "cod" | "card"
      paymentStatus,   // ✅ matches enum exactly
      transactionId: uuidv4(),
      createdAt: new Date(),
    });

    return res.status(201).json(payment);
  } catch (error) {
    console.error("Create payment error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create payment" });
  }
};


/**
 * STRIPE CHECKOUT SESSION
 * POST /api/payments/create-checkout-session
 */
const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user; // from protect middleware (optional for now)

    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required" });
    }

    console.log("Stripe products payload =====", products);

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: product?.name || product?.courseId?.title || "Product",
          images: product?.images
            ? [product.images[0]]
            : product?.courseId?.image
            ? [product.courseId.image]
            : [],
        },
        unit_amount: Math.round(
          (product?.price ||
            product?.discountPrice ||
            product?.courseId?.price ||
            0) * 100
        ),
      },
      quantity: product?.quantity || 1,
    }));

    console.log("Stripe lineItems =====", lineItems);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      metadata: {
        userId: user?._id?.toString() || "",
      },
      success_url: `${client_domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${client_domain}/payment/cancel`,
    });

    return res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe create-checkout-session error:", error);
    res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error - payment failed",
    });
  }
};


/**
 * GET STRIPE SESSION STATUS
 * GET /api/payments/session-status?session_id=...
 */
const getSessionStatus = async (req, res) => {
  try {
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ message: "session_id is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.send({
      status: session?.status,
      customer_email: session?.customer_details?.email,
      payment_status: session?.payment_status,
      amount_total: session?.amount_total,
      currency: session?.currency,
    });
  } catch (error) {
    console.error("Stripe session-status error:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal server error" });
  }
};


/**
 * ADMIN / INTERNAL: GET ALL PAYMENTS
 * GET /api/payments
 */
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("order user vendor");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  createCheckoutSession,
  getSessionStatus,
  getPayments,
};
