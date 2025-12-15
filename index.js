const dotenv = require("dotenv");
dotenv.config(); // must be at the very top

const express = require("express");
const cors = require("cors");
const http = require("http");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

// Check Stripe key immediately
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY is missing in .env!");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

/* ================= DATABASE ================= */
connectDB();

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.status(200).send("API running");
});

/* ================= ROUTES ================= */
app.use("/api", Routes);

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ================= PROCESS SAFETY ================= */
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  process.exit(1);
});
