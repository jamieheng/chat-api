const express = require("express");
const router = express.Router();
const createRoom = require("../controllers/group_controller"); // Update the path to your controller

// POST route to create a room
router.post("/create-room", createRoom.createRoom);

module.exports = router;
