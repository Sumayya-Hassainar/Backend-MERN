const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config(); // ✅ MUST be at the very top before using process.env

const app = express();

// ===== CORS CONFIG =====

app.use(
  cors({
    origin:"https://steady-seahorse-88dd5f.netlify.app",
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
