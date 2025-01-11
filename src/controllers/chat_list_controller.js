const ChatList = require("../models/chat_list_model");
const Message = require("../models/message_model");
const Room = require("../models/room_model");

// Add a new chat entry to the list
const addChatToList = async (req, res) => {
	try {
		const {
			user_id,
			profile_picture,
			name,
			last_message,
			last_message_timestamp,
			room_id,
			receiver_id,
			isGroup = false,
		} = req.body;

		// Check if the required fields are present
		if (!user_id || !name || !last_message || !receiver_id || !room_id) {
			return res.status(400).json({
				message: "Missing required fields.",
				status: "fail",
			});
		}

		// 2. Create a new chat list entry for both users and associate them with the room
		const chatListEntryUser1 = new ChatList({
			user_id,
			profile_picture,
			name,
			last_message,
			last_message_timestamp,
			receiver_id,
			room_id,
			isGroup,
		});

		const chatListEntryUser2 = new ChatList({
			user_id: receiver_id,
			profile_picture,
			name,
			last_message,
			last_message_timestamp,
			receiver_id: user_id,
			room_id,
			isGroup,
		});

		// Save the chat list entries for both users
		await chatListEntryUser1.save();
		await chatListEntryUser2.save();

		// 3. Return success response
		res.status(201).json({
			message: "Chat list entry added successfully!",
			status: "success",
			data: { chatListEntryUser1, chatListEntryUser2 },
		});
	} catch (error) {
		console.error("Error in addChatToList:", error.message);
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

// Get chat list by user ID
const getChatList = async (req, res) => {
	try {
		const { user_id } = req.query;

		// Check if the user_id is provided
		if (!user_id) {
			return res.status(400).json({
				message: "User ID is required.",
				status: "fail",
			});
		}

		// Find all chat entries for the user, both individual and group chats
		const chatList = await ChatList.find({
			$or: [{ user_id: user_id }],
		})
			.populate("room_id", "name") // Populate room details if needed
			.sort({ last_message_timestamp: -1 }); // Optional: Sort by last message timestamp

		// If no chat list entries found
		if (chatList.length === 0) {
			return res.status(404).json({
				message: "No chat entries found for the user.",
				status: "fail",
			});
		}

		// Return the chat list entries
		res.status(200).json({
			message: "Chat list retrieved successfully.",
			status: "success",
			data: chatList,
		});
	} catch (error) {
		console.error("Error in getChatListByUserId:", error.message);
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

module.exports = {
	addChatToList,
	getChatList, // Export the new function
};
