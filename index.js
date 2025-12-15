const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");
const path = require("path");


dotenv.config();

const app = express();
const server = http.createServer(app);

/* ================= DATABASE ================= */
connectDB();

/* ================= TRUST PROXY (IMPORTANT FOR DEPLOY) ================= */
app.set("trust proxy", 1); // 🔥 REQUIRED for Render / Railway / Netlify calls

/* ================= MIDDLEWARE ================= */
app.use(compression());
app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================= CORS (DEPLOY SAFE) ================= */
app.use(cors({
  origin: true, // 🔥 allow deployed frontend dynamically
  credentials: true,
}));

/* ================= RATE LIMIT ================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/* ================= SOCKET.IO ================= */
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    if (chatId) socket.join(chatId);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

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
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
  process.exit(1);
});
