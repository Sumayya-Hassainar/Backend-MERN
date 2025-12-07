// routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getChats, createChat, sendMessage } = require("../controllers/chatController");

// Get all chats for the logged-in user
router.get("/", protect, getChats);

// Create a new chat (customer initiates)
router.post("/", protect, createChat);

// Send a message in a chat
router.post("/:chatId/message", protect, sendMessage);

module.exports = router;

