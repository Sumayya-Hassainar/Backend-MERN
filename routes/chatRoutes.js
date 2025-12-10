const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  getChats,
  createChat,
  sendMessageWithAI
} = require("../controllers/chatController");

// GET ALL CHATS
router.get("/", protect, getChats);

// CREATE CHAT FOR ORDER
router.post("/", protect, createChat);

// SEND MESSAGE + AI RESPONSE
router.post("/:chatId/message", protect, sendMessageWithAI);

module.exports = router;
