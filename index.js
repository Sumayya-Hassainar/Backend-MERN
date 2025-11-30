const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config(); // ✅ MUST be at the very top before using process.env

const app = express();

// ===== CORS CONFIG =====
const allowedOrigins = [
  "http://localhost:5173",                        // local frontend
  process.env.CLIENT_URL,                         // Vercel URL from env
].filter(Boolean); // remove undefined

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// =======================

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to my backend app");
});

app.use("/api", Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
