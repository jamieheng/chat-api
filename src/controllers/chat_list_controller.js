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
			receiver_id,
		} = req.body;

		// Check if the required fields are present
		if (!user_id || !name || !last_message || !receiver_id) {
			return res.status(400).json({
				message: "Missing required fields.",
				status: "fail",
			});
		}

		// 1. Create a new room for the chat
		const newRoom = new Room({
			room_id: `${user_id}_${receiver_id}`,
			participants: [user_id, receiver_id],
			owner: user_id,
		});

		// Save the room to the database
		const room = await newRoom.save();

		// 2. Create a new chat list entry for both users and associate them with the room
		const chatListEntryUser1 = new ChatList({
			user_id,
			profile_picture,
			name,
			last_message,
			last_message_timestamp,
			receiver_id,
			room_id: room._id,
		});

		const chatListEntryUser2 = new ChatList({
			user_id: receiver_id,
			profile_picture,
			name,
			last_message,
			last_message_timestamp,
			receiver_id: user_id,
			room_id: room._id,
		});

		// Save the chat list entries for both users
		await chatListEntryUser1.save();
		await chatListEntryUser2.save();

		// 3. Return success response
		res.status(201).json({
			message: "Chat list entry and room added successfully!",
			status: "success",
			data: { chatListEntryUser1, chatListEntryUser2, room },
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

// Fetch chat list for a user (including last message and timestamp)
const getChatList = async (req, res) => {
	try {
		const { user_id } = req.query;

		if (!user_id) {
			return res.status(400).json({
				message: "User ID is required.",
				status: "fail",
			});
		}

		// Get all rooms the user is part of
		const rooms = await Room.find({ participants: user_id });

		if (!rooms.length) {
			return res.status(404).json({
				message: "No chats found.",
				status: "fail",
			});
		}

		// Populate the chat list with the last message for each room
		const chatList = [];
		for (let room of rooms) {
			const lastMessage = await Message.findOne({ roomId: room._id }).sort({
				timestamp: -1,
			});
			const otherParticipant = room.participants.find(
				(participant) => participant !== user_id
			);

			const chat = {
				user_id: otherParticipant,
				profile_picture: `/uploads/${otherParticipant}.jpg`,
				name: otherParticipant,
				last_message: lastMessage ? lastMessage.content : "No messages yet",
				last_message_timestamp: lastMessage
					? lastMessage.timestamp
					: new Date(),
				participants: room.participants,
			};

			chatList.push(chat);
		}

		res.status(200).json({
			message: "Chat list retrieved successfully.",
			status: "success",
			data: chatList,
		});
	} catch (error) {
		console.error("Error in getChatList:", error.message);
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

module.exports = {
	addChatToList,
	getChatList,
};
