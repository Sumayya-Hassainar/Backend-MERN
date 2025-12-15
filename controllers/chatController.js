const { HfInference } = require("@huggingface/inference");

const hfClient = process.env.HF_API_KEY
  ? new HfInference(process.env.HF_API_KEY)
  : null;

// A lightweight text model (most reliable)
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2";

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ---------- FALLBACK MODE ----------
    if (!hfClient) {
      return res.json({
        reply: "AI (demo mode): Live AI is unavailable, but your system is working correctly.",
        source: "fallback",
      });
    }

    // ---------- HUGGINGFACE ----------
    const response = await hfClient.textGeneration({
      model: MODEL,
      inputs: message,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
      },
    });

    const reply =
      response.generated_text ||
      "AI (fallback): Unable to generate response.";

    return res.json({
      reply,
      source: "huggingface",
    });

  } catch (err) {
    console.error("🔥 AI ERROR:", err.message);

    // ---------- SAFE FALLBACK ----------
    return res.json({
      reply: "AI (demo mode): Sorry, live AI is unavailable. This is a fallback response.",
      source: "fallback",
    });
  }
};
