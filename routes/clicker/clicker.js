const express = require('express');
const router = express.Router();
const ClickerUser = require('../../Modal/clickerModal/register');

router.post('/', async (req, res) => {
  try {
    const { ApplicationID, email, password, expireDay } = req.body;

    if (!ApplicationID || !email || !password || expireDay === undefined) {
      return res.status(400).json({ 
        error: 'ApplicationID, email, password and expireDay are required' 
      });
    }

    const days = Number(expireDay);
    if (isNaN(days) || days < 1 || days > 365) {
      return res.status(400).json({ error: 'expireDay must be between 1 and 365' });
    }

    const existingUser = await ClickerUser.findOne({
      $or: [{ ApplicationId: ApplicationID }, { email: email }]
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // ✅ No manual hashing – schema pre-save middleware will handle it
    const newUser = new ClickerUser({
      ApplicationId: ApplicationID,
      email: email,   // schema ka lowercase: true automatically lowercases
      password: password,   // ← plain password, middleware hash karega
      expireDay: days,
    });

    await newUser.save();

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