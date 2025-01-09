const User = require("../models/users_model");

// Generate a static OTP
const STATIC_OTP = "123456";

// OTP Verification
const verifyOtp = async (req, res) => {
	try {
		const { phone, otp } = req.body;

		// Check if the phone number exists in the database
		const user = await User.findOne({ phoneNumber: phone });
		if (user) {
			return res.status(404).json({
				message: "Number already has an account!",
				status: "fail",
				data: null,
			});
		}

		// Validate the OTP
		if (otp !== STATIC_OTP) {
			return res.status(401).json({
				message: "Invalid OTP.",
				status: "fail",
				data: null,
			});
		}

		res.status(200).json({
			message: "OTP verified successfully. Proceeding with registration.",
			status: "success",
			data: {
				phoneNumber: phone, // Use phoneNumber directly, not user object
			},
		});
	} catch (error) {
		console.error(error); // Log the error for debugging
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

const register = async (req, res) => {
	try {
		const { firstName, lastName, username, phoneNumber, profileImage } =
			req.body;

		// Check if the username or phone number already exists
		const existingUser = await User.findOne({
			$or: [{ username }, { phoneNumber }],
		});
		if (existingUser) {
			return res.status(400).json({
				message: "Username or phone number already in use.",
				status: "fail",
				data: null,
			});
		}

		// If profile image is Base64 encoded, store it as is or convert if necessary
		const profileImageUrl = profileImage ? profileImage : null;

		// Create a new user
		const newUser = new User({
			firstName,
			lastName,
			username,
			phoneNumber,
			profileImage: profileImageUrl, // Store the Base64 string as the profile image
		});

		await newUser.save();

		res.status(201).json({
			message: "User registered successfully!",
			status: "success",
			data: {
				userId: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				username: newUser.username,
				phoneNumber: newUser.phoneNumber,
				profileImage: newUser.profileImage,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

// Login a user
const login = async (req, res) => {
	try {
		const { phone, otp } = req.body;

		// Check if the user exists by phone number
		const user = await User.findOne({ phoneNumber: phone });
		if (!user) {
			return res.status(404).json({
				message: "User not found.",
				status: "fail",
				data: null,
			});
		}

		// Validate the OTP
		if (otp !== STATIC_OTP) {
			return res.status(401).json({
				message: "Invalid OTP.",
				status: "fail",
				data: null,
			});
		}

		// Success - redirect to the Socket.IO client page
		res.status(200).json({
			message: "Login successful!",
			status: "success",
			data: {
				userId: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				phoneNumber: user.phoneNumber,
				profileImage: user.profileImage,
				//redirectUrl: "http://127.0.0.1:5500/src/sample.ui/index.test.html", // URL for the Socket.IO page
			},
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

// Logout a user
const logout = (req, res) => {
	try {
		// Invalidate session or token if necessary here

		res.status(200).json({
			message: "Logout successful!",
			status: "success",
			data: null,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

const getUser = async (req, res) => {
	try {
		const { userId } = req.params;

		// Find the user by their userId
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				message: "User not found.",
				status: "fail",
				data: null,
			});
		}

		res.status(200).json({
			message: "User retrieved successfully.",
			status: "success",
			data: {
				userId: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				username: user.username,
				phoneNumber: user.phoneNumber,
				profileImage: user.profileImage,
			},
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error.",
			status: "error",
			error: error.message,
		});
	}
};

module.exports = {
	register,
	login,
	logout,
	verifyOtp,
	getUser,
};
