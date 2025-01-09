const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
	creator_user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	contact_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	firstName: { type: String },
	lastName: { type: String },
	phoneNumber: { type: String, required: true },
	profileImage: { type: String },
	createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
