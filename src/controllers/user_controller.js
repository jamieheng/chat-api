const User = require("../models/users_model"); // Adjust the path as needed

// Generate a static OTP
const STATIC_OTP = "123456"; // Replace this with a secure OTP generator in production

// Register a new user
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

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      phoneNumber,
      profileImage,
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
        phoneNumber: user.phoneNumber,
        profileImage: user.profileImage,
        redirectUrl: "http://127.0.0.1:5500/src/sample.ui/index.test.html", // URL for the Socket.IO page
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

module.exports = {
  register,
  login,
  logout,
};
