// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

// ------------------ DATABASE ------------------
(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message || err);
    process.exit(1);
  }
})();

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://silly-cascaron-014ccd.netlify.app"
  ],
  credentials: true,
}));

// ------------------ SOCKET.IO ------------------
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://silly-cascaron-014ccd.netlify.app"
    ],
    methods: ["GET","POST"],
    credentials: true,
  }
});

// Make io accessible in routes/controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // Join a chat room
  socket.on("joinChat", (chatId) => {
    if (chatId) {
      socket.join(chatId);
      console.log(`⚡ Socket ${socket.id} joined chat ${chatId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("⚡ Client disconnected:", socket.id);
  });
});

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => res.send("Welcome to backend app"));

// ------------------ API ROUTES ------------------
app.use("/api", Routes);

// ------------------ 404 HANDLER ------------------
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ------------------ GLOBAL ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
