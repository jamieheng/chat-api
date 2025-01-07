const express = require("express");
const mongoose = require("mongoose");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const Message = require("./models/message_model");
const Room = require("./models/room_model");

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.static("public")); // Serve static files from 'public' directory
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Routes
const userRoutes = require("./routes/user_route");
const messageRoutes = require("./routes/chat_route");
const groupRoutes = require("./routes/group_route");

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

// Retrieve environment variables
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGO_URI;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join the room based on room_id
  socket.on("joinRoom", async (room_id) => {
    if (!room_id) {
      console.error("joinRoom: Missing room_id");
      socket.emit("error", { message: "Room ID is required to join." });
      return;
    }

    try {
      // Check if the room exists in the database using custom `room_id`
      let room = await Room.findOne({ room_id });
      if (!room) {
        console.log("joinRoom: Room not found, creating a new room.");

        // Create the room
        room = new Room({ room_id, participants: [] });
        await room.save();

        console.log(`joinRoom: New room created with ID: ${room_id}`);
      }

      // Join the socket to the room
      socket.join(room_id);
      console.log(`User ${socket.id} joined room: ${room_id}`);
      socket.emit("roomJoined", { room_id, isGroup: room.isGroup });
    } catch (error) {
      console.error("joinRoom: Error handling room join", error.message);
      socket.emit("error", { message: "Failed to join the room." });
    }
  });

  // Listen for a "sendMessage" event from the client
  // socket.on("sendMessage", async (data) => {
  //   try {
  //     const { room_id, sender_id, receiver_id, content, media } = data;

  //     // Validate the incoming data
  //     if (!room_id || !sender_id || !receiver_id || (!content && !media)) {
  //       console.error("sendMessage: Missing required fields", data);
  //       socket.emit("error", { message: "Missing required fields." });
  //       return;
  //     }

  //     // Check if the room exists using the room_id
  //     const room = await Room.findOne({ room_id });
  //     if (!room) {
  //       console.error("sendMessage: Room not found", room_id);
  //       socket.emit("error", { message: "Room not found." });
  //       return;
  //     }

  //     // Create and save the message
  //     const message = new Message({
  //       roomId: room_id,
  //       sender_id,
  //       receiver_id, // Ensure receiver_id is saved
  //       content,
  //       media,
  //     });

  //     const savedMessage = await message.save();

  //     // Emit the message to all clients in the room
  //     io.to(room_id).emit("receiveMessage", savedMessage);
  //     console.log("sendMessage: Message saved and emitted", savedMessage);
  //   } catch (error) {
  //     console.error("sendMessage: Error saving message", error.message);
  //     socket.emit("error", { message: "Failed to send message." });
  //   }
  // });

  // socket.on("sendMessage", async (data) => {
  //   const { room_id, sender_id, content } = data;

  //   // Broadcast message to all users in the room
  //   io.to(room_id).emit("receiveMessage", { sender_id, content });
  //   console.log(`Message sent to room ${room_id}: ${content}`);
  // });

  socket.on("sendMessage", async (data) => {
    try {
      const { room_id, sender_id, receiver_id, content, media } = data;

      // Ensure that content or media is provided
      if (!room_id || !sender_id || (!content && !media)) {
        console.error("sendMessage: Missing required fields", data);
        socket.emit("error", { message: "Missing required fields." });
        return;
      }

      // If it's a group message, receiver_id is not necessary
      const room = await Room.findOne({ room_id });
      if (!room) {
        console.error("sendMessage: Room not found", room_id);
        socket.emit("error", { message: "Room not found." });
        return;
      }

      // If this is a group message, we set receiver_id to null
      const messageReceiverId = room.isGroup ? null : receiver_id;

      // Create and save the message
      const message = new Message({
        roomId: room_id,
        sender_id,
        receiver_id: messageReceiverId, // This will be null for group messages
        content,
        media,
      });

      const savedMessage = await message.save();

      // Emit the message to all clients in the room
      io.to(room_id).emit("receiveMessage", savedMessage);
      console.log("sendMessage: Message saved and emitted", savedMessage);
    } catch (error) {
      console.error("sendMessage: Error saving message", error.message);
      socket.emit("error", { message: "Failed to send message." });
    }
  });

  // Listen for typing events
  socket.on("typing", (room_id) => {
    if (!room_id) {
      console.error("typing: Missing room_id");
      socket.emit("error", {
        message: "Room ID is required for typing events.",
      });
      return;
    }

    socket.to(room_id).emit("typing", { room_id, user: socket.id });
  });

  // Listen for stopTyping events
  socket.on("stopTyping", (room_id) => {
    if (!room_id) {
      console.error("stopTyping: Missing room_id");
      socket.emit("error", {
        message: "Room ID is required for stopTyping events.",
      });
      return;
    }

    socket.to(room_id).emit("stopTyping", { room_id, user: socket.id });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully!");
    console.log(`Server is running on port ${PORT}`);
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  });

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
