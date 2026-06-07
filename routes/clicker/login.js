const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const ClickerUser = require('../../Modal/clickerModal/register');

// POST /clicker/login - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await ClickerUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ Include expireDay in the response
    res.status(200).json({
      message: 'Login successful',
      user: {
        ApplicationId: user.ApplicationId,
        email: user.email,
        expireDay: user.expireDay,   // added this line
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;