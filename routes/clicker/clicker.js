const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ClickerUser = require('../../Modal/clickerModal/register');

// POST /clicker - Registration with expireDay
router.post('/', async (req, res) => {
  try {
    const { ApplicationID, email, password, expireDay } = req.body;

    // Basic validation (expireDay added)
    if (!ApplicationID || !email || !password || expireDay === undefined) {
      return res.status(400).json({ 
        error: 'ApplicationID, email, password and expireDay are required' 
      });
    }

    // Validate expireDay is a number between 1 and 365
    const days = Number(expireDay);
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({ error: 'expireDay must be a number between 1 and 365' });
    }

    // Check existing user
    const existingUser = await ClickerUser.findOne({
      $or: [{ ApplicationId: ApplicationID }, { email: email }]
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this ApplicationID or email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document including expireDay
    const newUser = new ClickerUser({
      ApplicationId: ApplicationID,
      email: email,
      password: hashedPassword,
      expireDay: days,
    });

    await newUser.save();

    // Respond without password
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        ApplicationId: newUser.ApplicationId,
        email: newUser.email,
        expireDay: newUser.expireDay,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;