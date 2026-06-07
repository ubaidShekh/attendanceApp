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
    required: [true, "Expire day is required"],
    min: 1,
    max: 365, // optional validation
    default: 30, // optional default
  },
});

// Password hashing middleware (optional, but recommended)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("ClickerUser", userSchema);