// controllers/chatController.js
const Chat = require("../models/Chat");

// Get all chats for the logged-in user (customer or vendor)
const getChats = async (req, res) => {
  try {
    const isVendor = req.user.role === "vendor";

    const chats = await Chat.find(isVendor ? { vendor: req.user._id } : { customer: req.user._id })
      .populate("customer", "name email")
      .populate("vendor", "name email")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// Create a new chat (if no chat exists between customer and vendor)
const createChat = async (req, res) => {
  const { vendorId } = req.body;
  if (!vendorId) return res.status(400).json({ message: "Vendor ID is required" });

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({ customer: req.user._id, vendor: vendorId });
    if (!chat) {
      chat = new Chat({ customer: req.user._id, vendor: vendorId, messages: [] });
      await chat.save();
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

// Send a message in a chat
const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;

  if (!content) return res.status(400).json({ message: "Message content is required" });

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const sender = req.user.role === "vendor" ? "vendor" : "customer";

    chat.messages.push({ sender, content });
    await chat.save();

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

module.exports = { getChats, createChat, sendMessage };
