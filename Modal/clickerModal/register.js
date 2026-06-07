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
  expireDay: {
    type: Number,
    required: false,
    default: 30,
  },
});

// ✅ Correct pre-save middleware for async/await (no next parameter)
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; // Mongoose will handle the error
  }
});

module.exports = mongoose.model("ClickerUser", userSchema);