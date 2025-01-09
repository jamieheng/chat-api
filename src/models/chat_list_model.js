// models/chat_list_model.js
const mongoose = require("mongoose");

const chatListSchema = new mongoose.Schema({
	user_id: { type: String, required: true }, // The ID of the user (e.g., 'user1')
	profile_picture: { type: String }, // URL or path to the profile picture
	name: { type: String, required: true }, // Name of the person in the chat
	last_message: { type: String, required: true }, // The last message sent in the chat
	last_message_timestamp: { type: Date, default: Date.now }, // Timestamp of the last message
	receiver_id: { type: String, required: true }, // ID of the other user in the chat
	room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
});

const ChatList = mongoose.model("ChatList", chatListSchema);

module.exports = ChatList;
