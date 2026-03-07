const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    // ...
  },
  employeeId: {
    type: String,
    required: [true, "Employee ID is required"],
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    default: "",
  },
  password: {
    type: String,
  },
  image: {
    type: String, // base64 encoded image
    required: false,
  },
});

// ... (password hashing commented out)

module.exports = mongoose.model("User", userSchema);
