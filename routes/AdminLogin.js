// backend/routes/AdminLogin.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminDetails = require('../models/AdminDetails');

const router = express.Router();

// POST route for Admin Login
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Check if the Admin user exists
    const admin = await AdminDetails.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    // 2. Validate the password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. Generate a secure JWT Token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'erp_fallback_secret_key', 
      { expiresIn: '1d' }
    );

    // 4. Send success response
    res.status(200).json({
      message: 'Admin Login successful',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin login.' });
  }
});

module.exports = router;