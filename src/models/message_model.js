// models/message_model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.String,
    ref: "Room", // Reference to the Room model
    required: true,
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (sender)
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (receiver)
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  media: {
    type: mongoose.Schema.Types.Mixed, // To store media (e.g., URLs, file data)
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Timestamp for when the message was sent
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
