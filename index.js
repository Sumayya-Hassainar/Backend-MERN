// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const Routes = require("./routes/indexRoutes");

dotenv.config();
const app = express();

// ------------------ DATABASE ------------------
(async () => {
  try {
    await connectDB();
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message || err);
    process.exit(1); // Stop server if DB fails
  }
})();

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://silly-cascaron-014ccd.netlify.app",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ HUGGINGFACE AI SETUP ------------------
let HfInference;
let hfClient = null;

try {
  ({ HfInference } = require("@huggingface/inference"));
  if (process.env.HF_API_KEY) {
    hfClient = new HfInference(process.env.HF_API_KEY);
    console.log("✅ HuggingFace AI Enabled");
  } else {
    console.warn("⚠️ HF_API_KEY missing. AI chat disabled.");
  }
} catch (err) {
  console.warn("⚠️ HuggingFace SDK not installed. AI chat disabled.");
}

// ------------------ AI MODEL CONFIG ------------------
const AI_MODEL = "EleutherAI/gpt-neo-125M";

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => res.send("Welcome to my backend app"));

// ------------------ API ROUTES ------------------
app.use("/api", Routes);

// ------------------ AI CHAT ENDPOINT ------------------
app.post("/api/ai-chat", async (req, res) => {
  if (!hfClient) {
    return res.status(503).json({ error: "AI service disabled on this server" });
  }

  const { message: userMessage } = req.body;
  if (!userMessage) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await hfClient.textGeneration({
      model: AI_MODEL,
      inputs: userMessage,
      max_new_tokens: 200,
    });

    const reply = Array.isArray(response)
      ? response[0]?.generated_text || "No response from model"
      : response?.generated_text || "No response from model";

    res.json({ reply });
  } catch (err) {
    console.error("🔥 HUGGINGFACE ERROR:", err?.message || err);
    res.status(500).json({ error: "HuggingFace API Error" });
  }
});

// ------------------ 404 HANDLER ------------------
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ------------------ GLOBAL ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

/*
⚠️ NOTE FOR LOCAL DEVELOPMENT:
- If you are seeing SSL errors in Postman or frontend (EPROTO / WRONG_VERSION_NUMBER),
  make sure to use `http://localhost:${PORT}` instead of `https://`.
- HTTPS requires SSL certificate configuration (self-signed or valid certificate).
*/
