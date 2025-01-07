const express = require("express");
const router = express.Router();
const userController = require("../controllers/user_controller");

// Register a new user
router.post("/register", userController.register);

// Login a user
router.post("/login", userController.login);

// Logout a user
router.post("/logout", userController.logout);

module.exports = router;
