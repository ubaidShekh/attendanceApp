const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    // ...
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

module.exports = mongoose.model("UserIOT", userSchema);
