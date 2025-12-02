const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://silly-cascaron-014ccd.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// ✅ health check
app.get("/", (req, res) => {
  res.send("Welcome to my backend app");
});

// ✅ ALL your API routes under /api
app.use("/api", Routes);

/**
 * ⛔ If you have something like this:
 * app.get("*", (req, res) => {...})
 * or
 * app.use("*", (req, res) => {...})
 * make sure:
 *   1) it comes AFTER /api
 *   2) it does NOT use weird patterns
 */

// OPTIONAL 404 handler (safe)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
