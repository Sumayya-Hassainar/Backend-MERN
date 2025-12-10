const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["customer", "support"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
