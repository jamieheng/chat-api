const express = require("express");
const contactController = require("../controllers/contact_controller");

const router = express.Router();

// Route to create a new contact
router.post("/contacts", contactController.createContact);

// Route to get all contacts for a user
router.get("/contacts/:userId", contactController.getContacts);

// Route to delete a contact by ID
router.delete("/contacts/:contactId", contactController.deleteContact);

module.exports = router;
