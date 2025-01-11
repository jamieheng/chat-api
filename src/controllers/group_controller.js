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

		// Find the creator
		const creator = await User.findById(creator_id);
		if (!creator) {
			return res.status(404).json({
				message: "Creator not found.",
				status: "fail",
			});
		}

		// Prepare participants array
		let allParticipants = Array.isArray(participants)
			? participants
			: [participants];
		allParticipants.unshift(creator_id);

		// Ensure uniqueness
		allParticipants = [...new Set(allParticipants)];

		// Validate participants
		for (let participant of allParticipants) {
			const user = await User.findById(participant);
			if (!user) {
				return res.status(404).json({
					message: `Participant with ID ${participant} not found.`,
					status: "fail",
				});
			}
		}

		// Generate room ID
		const room_id = isGroup
			? `group-${Date.now()}`
			: allParticipants.sort().join("-");

		// Create and save room
		const room = new Room({
			room_id,
			participants: allParticipants,
			isGroup,
			owner: creator_id,
		});

		await room.save();

		// Populate participants for response
		const populatedRoom = await Room.findById(room._id).populate(
			"participants",
			"name avatar"
		);

		res.status(201).json({
			message: "Room created successfully.",
			status: "success",
			data: populatedRoom,
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
