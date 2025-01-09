const Room = require("../models/room_model");
const User = require("../models/users_model");

// Create a room (set room creator as owner)
const createRoom = async (req, res) => {
	try {
		const { creator_id, participants, isGroup } = req.body;

		if (!creator_id) {
			return res.status(400).json({
				message: "Creator ID is required.",
				status: "fail",
			});
		}

		// Find the creator in the database
		const creator = await User.findById(creator_id);
		if (!creator) {
			return res.status(404).json({
				message: "Creator not found.",
				status: "fail",
			});
		}

		// Ensure participants is an array (if only one participant is provided, make it an array)
		const allParticipants = Array.isArray(participants)
			? participants
			: [participants];
		allParticipants.unshift(creator_id); // Include the creator in participants

		// Generate a unique room ID (for group rooms)
		const room_id = isGroup
			? `group-${Date.now()}`
			: allParticipants.sort().join("-");

		// Create a new room document
		const room = new Room({
			room_id,
			participants: allParticipants, // Include creator and any other participants
			isGroup,
			owner: creator_id, // Set the creator as the room owner
		});

		// Save the room
		await room.save();

		res.status(201).json({
			message: "Room created successfully.",
			status: "success",
			data: room,
		});
	} catch (error) {
		console.error("Error in createRoom:", error.message);
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

module.exports = {
	createRoom,
};
