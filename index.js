const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config();

const app = express();

// CORS (keep as we set earlier)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://frontend-mern-bq1o.vercel.app", // your Vercel URL
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to my backend app");
});

// All API routes start with /api
app.use("/api", Routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
