const express = require("express");
const messageController = require("../controllers/message_controller");
const router = express.Router();

// Send a message with optional media
router.post(
  "/send",
  messageController.upload.single("media"),
  messageController.sendMessage
);

// Get chat messages between two users
router.get("/", messageController.getMessages);

module.exports = router;
