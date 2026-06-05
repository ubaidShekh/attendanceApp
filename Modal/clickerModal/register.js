const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
 
  ApplicationId: {
    type: String,
    required: [true, "Employee ID is required"],
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
 
  password: {
    type: String,
  },
 
});

// ... (password hashing commented out)

module.exports = mongoose.model("ClickerUser", userSchema);
