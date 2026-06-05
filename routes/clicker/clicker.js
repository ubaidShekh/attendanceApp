const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ClickerUser = require('../../Modal/clickerModal/register'); // adjust path to your model

// POST /api/register - save user data
router.post('/', async (req, res) => {
  try {
    const { ApplicationID, email, password } = req.body;

    // Basic validation
    if (!ApplicationID || !email || !password) {
      return res.status(400).json({ error: 'ApplicationID, email and password are required' });
    }

    // Check if user already exists (by ApplicationID or email)
    const existingUser = await ClickerUser.findOne({
      $or: [{ ApplicationId: ApplicationID }, { email: email }]
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this ApplicationID or email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = new ClickerUser({
      ApplicationId: ApplicationID,
      email: email,
      password: hashedPassword,
    });

    // Save to database
    await newUser.save();

    // Respond with success (do not send back password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ApplicationId: newUser.ApplicationId,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;