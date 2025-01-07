const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  username: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  profileImage: { type: String },
  is_active: { type: Boolean, required: true, default: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
