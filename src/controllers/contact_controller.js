const Contact = require("../models/contact_model");
const User = require("../models/users_model");

// Create a new contact
const createContact = async (req, res) => {
	const { firstName, lastName, phoneNumber, profileImage, creator_user_id } =
		req.body;

	try {
		///
		// Check if the phone number belongs to an existing user
		const user = await User.findOne({ phoneNumber });

		const newContact = new Contact({
			creator_user_id,
			contact_user_id: user ? user._id : null,
			firstName,
			lastName,
			phoneNumber,
			profileImage: profileImage || (user ? user.profileImage : null),
		});

		await newContact.save();
		res
			.status(201)
			.json({ message: "Contact added successfully", contact: newContact });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error adding contact", error: error.message });
	}
};

// Get a list of all contacts for a user
const getContacts = async (req, res) => {
	const userId = req.params.userId;
	const { search } = req.query;

	try {
		const query = { creator_user_id: userId };

		if (search) {
			query.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
			];
		}

		// Find and populate contact details
		const contacts = await Contact.find(query)
			.populate("creator_user_id", "_id firstName lastName profileImage")
			.populate("contact_user_id", "_id firstName lastName profileImage");

		res.status(200).json({
			message: "Contacts fetched successfully",
			contacts,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error fetching contacts",
			error: error.message,
		});
	}
};

// Delete a contact
const deleteContact = async (req, res) => {
	const contactId = req.params.contactId;

	try {
		const deletedContact = await Contact.findByIdAndDelete(contactId);
		if (!deletedContact) {
			return res.status(404).json({ message: "Contact not found" });
		}
		res.status(200).json({ message: "Contact deleted successfully" });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error deleting contact", error: error.message });
	}
};

module.exports = {
	createContact,
	getContacts,
	deleteContact,
};
