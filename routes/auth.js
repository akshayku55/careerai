require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// ✅ Signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const newUser = new User({ name, email, password }); // password will be hashed via pre-save
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  console.log('📩 Signup Request Received:', { name, email, password });

  try {
    if (!name || !email || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ Email already exists');
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log('✅ New user created:', newUser.email);
    res.status(201).json({ message: 'User created successfully' });

  } catch (err) {
    console.error('🔥 Signup error:', err.message);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

module.exports = router;
