// backend/routes/EmployeeLogin.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const EmployeeDetails = require('../models/EmployeeDetails');

const router = express.Router();

// --- POST route for Employee Login ---
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the employee exists in the database
    const employee = await EmployeeDetails.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // 2. Validate the password
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // 3. Generate a secure JWT Token
    const token = jwt.sign(
      { id: employee._id, role: employee.role },
      process.env.JWT_SECRET || 'erp_fallback_secret_key', 
      { expiresIn: '1d' }
    );

    // 4. Send success response back to the frontend
    res.status(200).json({
      message: 'Login successful',
      token,
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- GET: Fetch Reference Images for AI Comparison ---
router.get('/profile/:id', async (req, res) => {
  try {
    const employee = await EmployeeDetails.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // UPDATED: We now send back the array of 5 images instead of just one string
    res.status(200).json({ referenceFaceImages: employee.referenceFaceImages });
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
});

module.exports = router;