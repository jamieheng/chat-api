const Message = require("../models/message_model");
const Room = require("../models/room_model");
const multer = require("multer");
const path = require("path");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename
  },
});

const upload = multer({ storage });

// Create or retrieve a private room
const findOrCreatePrivateRoom = async (sender_id, receiver_id) => {
  const roomId = [sender_id, receiver_id].sort().join("-");

  let room = await Room.findById(roomId);
  if (!room) {
    room = new Room({
      _id: roomId,
      participants: [sender_id, receiver_id],
      isGroup: false,
    });
    await room.save();
  }
  console.log("Room found or created:", room); // Log the room for verification
  return room;
};

// Send a message (with optional media)
const sendMessage = async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        message: "Sender and receiver IDs are required.",
        status: "fail",
      });
    }

    let mediaData = null;
    if (req.file) {
      mediaData = {
        type: req.file.mimetype.startsWith("image/") ? "image" : "file",
        url: `/uploads/${req.file.filename}`,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      };
    }

    const room = await findOrCreatePrivateRoom(sender_id, receiver_id);

    const message = new Message({
      roomId: room._id,
      sender_id,
      receiver_id,
      content,
      media: mediaData,
    });

    await message.save();

    // Emit the message to the clients in the room
    io.to(room._id).emit("receiveMessage", message);

    res.status(201).json({
      message: "Message sent successfully!",
      status: "success",
      data: message,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({
      message: "Server error.",
      status: "error",
      error: error.message,
    });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;

    if (!sender_id || !receiver_id) {
      return res.status(400).json({
        message: "Sender and receiver IDs are required.",
        status: "fail",
      });
    }

    const roomId = [sender_id, receiver_id].sort().join("-");

    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });

    if (!messages.length) {
      return res.status(404).json({
        message: "No messages found.",
        status: "fail",
      });
    }

    res.status(200).json({
      message: "Messages retrieved successfully.",
      status: "success",
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({
      message: "Server error.",
      status: "error",
      error: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  upload, // Export the multer upload middleware
};
