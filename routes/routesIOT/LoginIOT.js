const express = require("express");
const bcrypt = require("bcryptjs"); // IMPORTANT: Add bcrypt
const jwt = require("jsonwebtoken");
const User = require("../../Modal/ModalIOT/UserIOT");

const loginRouterIOT = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "mySimpleSecretKey123";

loginRouterIOT.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // IMPORTANT: Compare hashed password
    // If you're not using bcrypt in your User model, use direct comparison:
    // const isPasswordValid = password === user.password;

    // Using bcrypt (recommended):
    //const isPasswordValid = await bcrypt.compare(password, user.password);

    // If not using bcrypt, use direct comparison:
    // const isPasswordValid = password === user.password;

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      SECRET_KEY,
      { expiresIn: "24h" }, // Increased to 24h
    );

    // Return success response
    return res.json({
      success: true,
      token: token,
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,

        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

module.exports = loginRouterIOT;
