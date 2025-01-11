const express = require("express");
const chatListController = require("../controllers/chat_list_controller");
const router = express.Router();

// Get the chat list for a user
router.get("/getChatList", chatListController.getChatList);

// Adding a chat to the list
router.post("/createChatList", chatListController.addChatToList);

module.exports = router;
