/* ================= ENV ================= */
const dotenv = require("dotenv");
dotenv.config(); // MUST be first

/* ================= CORE ================= */
const express = require("express");
const cors = require("cors");
const http = require("http");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

/* ================= SOCKET ================= */
const { Server } = require("socket.io");

/* ================= APP FILES ================= */
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

/* ================= VALIDATE ENV ================= */
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ STRIPE_SECRET_KEY missing");
  process.exit(1);
}

/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

/* 🔥 Make io available in ALL controllers */
app.use((req, res, next) => {
  req.io = io;
  next();
});

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

/* ================= RATE LIMIT ================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

/* ================= HEALTH ================= */
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

/* ================= START ================= */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ================= PROCESS SAFETY ================= */

/* 🔴 Sync crashes */
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

/* 🔴 Async crashes */
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);

  // fail-fast ONLY in production
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});
