// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      sender: { type: String, enum: ["customer", "vendor"], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
