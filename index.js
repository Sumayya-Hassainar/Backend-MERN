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

// ------------------ SAFE HUGGING FACE LOAD ------------------
let HfInference;
try {
  ({ HfInference } = require("@huggingface/inference"));
} catch (err) {
  console.warn("⚠️ HuggingFace SDK not installed. AI chat disabled.");
}

let hfClient = null;
if (HfInference && process.env.HF_API_KEY) {
  hfClient = new HfInference(process.env.HF_API_KEY);
  console.log("✅ HuggingFace AI Enabled");
} else {
  console.warn("⚠️ HF_API_KEY missing. AI chat disabled.");
}

// ------------------ SUPPORTED MODEL ------------------
const AI_MODEL = "EleutherAI/gpt-neo-125M"; // Free-key compatible

// ------------------ MIDDLEWARE ------------------
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

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ DATABASE ------------------
connectDB();

// ------------------ HEALTH CHECK ------------------
app.get("/", (req, res) => {
  res.send("Welcome to my backend app");
});

// ------------------ EXISTING API ROUTES ------------------
app.use("/api", Routes);

// ------------------ AI CHAT ENDPOINT (WORKING) ------------------
app.post("/api/ai-chat", async (req, res) => {
  if (!hfClient) {
    return res.status(503).json({ error: "AI service disabled on this server" });
  }

  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await hfClient.textGeneration({
      model: AI_MODEL,
      inputs: userMessage,
      max_new_tokens: 200,
    });

    // textGeneration returns an array of objects
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
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ------------------ SERVER ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
