// backend/routes/Admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const EmployeeDetails = require('../models/EmployeeDetails');
const HRDetails = require('../models/HRDetails'); 

const router = express.Router();

// Route 1: Create an Employee Account
router.post('/create-employee', async (req, res) => {
  try {
    // UPDATED: We now extract referenceFaceImages (Array) from the frontend request
    const { name, email, password, referenceFaceImages } = req.body;

    // 1. Check if the email already exists
    const existingUser = await EmployeeDetails.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee email already exists.' });
    }

    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save the new employee to the database
    const newEmployee = new EmployeeDetails({
      name,
      email,
      password: hashedPassword,
      // UPDATED: Save the array to the database vault (defaults to empty array if none)
      referenceFaceImages: referenceFaceImages || [] 
    });

    await newEmployee.save();
    res.status(201).json({ message: `Employee ${name} created successfully!` });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error while creating employee.' });
  }
});

// Route 2: Create an HR Account
router.post('/create-hr', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingHR = await HRDetails.findOne({ email });
    if (existingHR) {
      return res.status(400).json({ message: 'HR email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newHR = new HRDetails({
      name,
      email,
      password: hashedPassword,
    });

    await newHR.save();
    res.status(201).json({ message: `HR User ${name} created successfully!` });

  } catch (error) {
    console.error('Error creating HR:', error);
    res.status(500).json({ message: 'Server error while creating HR.' });
  }
});

module.exports = router;