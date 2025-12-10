const Chat = require("../models/Chat");
const Message = require("../models/Message");
const { HfInference } = require("@huggingface/inference");

// Initialize HuggingFace
const hf = new HfInference(process.env.HF_API_KEY);
const AI_MODEL = "EleutherAI/gpt-neo-125M";

// -------------------- GET CHATS --------------------
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id })
      .populate("messages")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to load chats" });
  }
};

// -------------------- CREATE CHAT --------------------
exports.createChat = async (req, res) => {
  try {
    const { orderId } = req.body;

    const chat = await Chat.create({
      user: req.user._id,
      orderId,
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// -------------------- SEND MESSAGE + AI --------------------
exports.sendMessageWithAI = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Save user message
    const userMsg = await Message.create({
      chatId,
      sender: req.user._id,
      content,
      type: "user"
    });

    // Call HuggingFace
    let aiResponse = { generated_text: "AI not available" };

    try {
      aiResponse = await hf.textGeneration({
        model: AI_MODEL,
        inputs: content,
        max_new_tokens: 150,
      });
    } catch (err) {
      console.warn("AI ERROR:", err.message);
    }

    const aiText = Array.isArray(aiResponse)
      ? aiResponse[0]?.generated_text
      : aiResponse?.generated_text;

    // Save AI message
    const aiMsg = await Message.create({
      chatId,
      sender: null, // system
      content: aiText || "I'm here to help!",
      type: "ai"
    });

    // Update Chat time
    await Chat.findByIdAndUpdate(chatId, { updatedAt: Date.now() });

    res.json({
      userMessage: userMsg,
      aiMessage: aiMsg
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
};
