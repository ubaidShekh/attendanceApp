const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    //  required: [true, "Full name is required"],
    // trim: true,
    // minlength: [2, "Full name must be at least 2 characters"],
  },
  employeeId: {
    type: String,
    // required: [true, "Employee ID is required"],
    // unique: true,
    // uppercase: true,
    // trim: true,
    //match: [
    ////  /^EMP\d{3,}$/,
    //"Employee ID must start with EMP followed by numbers",
    // ],
  },
  email: {
    type: String,
    //required: [true, "Email is required"],
    unique: true,
    /// lowercase: true,
    // trim: true,
    // match: [
    //   /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    //   "Please enter a valid email",
    // ],
  },
  phone: {
    type: String,
    //  trim: true,
    //  default: "",
  },
  password: {
    type: String,
    // required: [true, "Password is required"],
    // minlength: [6, "Password must be at least 6 characters"],
  },
});

{
  /*// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log(error);
  }
}); */
}

{
  /*// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
 */
}
module.exports = mongoose.model("User", userSchema);
