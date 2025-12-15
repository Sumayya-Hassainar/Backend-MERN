const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ---------------- DATABASE ----------------
connectDB(); // no async IIFE nonsense

// ---------------- MIDDLEWARE ----------------
app.use(compression()); // 🔥 HUGE SPEED BOOST
app.use(express.json({ limit: "10kb" }));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://silly-cascaron-014ccd.netlify.app"
  ],
  credentials: true,
}));

// ---------------- RATE LIMIT ----------------
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
}));

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://silly-cascaron-014ccd.netlify.app"
    ],
    credentials: true,
  }
});

// ⚠️ DO NOT inject io into req globally
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

// ---------------- HEALTH ----------------
app.get("/", (_, res) => res.send("API running"));

// ---------------- ROUTES ----------------
app.use("/api", Routes);

// ---------------- ERRORS ----------------
app.use((req, res) =>
  res.status(404).json({ message: "Route not found" })
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// ---------------- START ----------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on ${PORT}`)
);
