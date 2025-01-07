const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  room_id: { type: String, required: true, unique: true }, // Custom room ID (string)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Optional
  isGroup: { type: Boolean, default: false }, // Optional
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Room", RoomSchema);
