const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");
const cookieParser = require("cookie-parser");

dotenv.config(); // ✅ MUST be at the very top before using process.env

const app = express();

// ===== CORS CONFIG =====
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",                        // dev
      "https://frontend-mern-17.onrender.com",   // deployed frontend
    ],
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
