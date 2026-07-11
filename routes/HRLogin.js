// backend/routes/HRLogin.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HRDetails = require('../models/HRDetails');

const router = express.Router();

// POST route for HR Login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the HR user exists
    const hrUser = await HRDetails.findOne({ email });
    if (!hrUser) {
      return res.status(404).json({ message: 'HR account not found.' });
    }

    // 2. Validate the password
    const isMatch = await bcrypt.compare(password, hrUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. Generate a secure JWT Token
    const token = jwt.sign(
      { id: hrUser._id, role: hrUser.role },
      process.env.JWT_SECRET || 'erp_fallback_secret_key', 
      { expiresIn: '1d' }
    );

    // 4. Send success response
    res.status(200).json({
      message: 'HR Login successful',
      token,
      user: {
        id: hrUser._id,
        name: hrUser.name,
        email: hrUser.email,
        role: hrUser.role
      }
    });

  } catch (error) {
    console.error('HR Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

module.exports = router;