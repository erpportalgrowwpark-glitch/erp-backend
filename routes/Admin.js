// backend/routes/Admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const EmployeeDetails = require('../models/EmployeeDetails');
const HRDetails = require('../models/HRDetails'); 

const router = express.Router();

// ---------------------------------------------------
// CREATE ROUTES
// ---------------------------------------------------

// Route: Create an Employee Account
router.post('/create-employee', async (req, res) => {
  try {
    const { name, email, password, referenceFaceImages, ...otherFields } = req.body;

    const existingUser = await EmployeeDetails.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Employee email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new EmployeeDetails({
      name,
      email,
      password: hashedPassword,
      referenceFaceImages: referenceFaceImages || [],
      role: 'employee',
      ...otherFields 
    });

    await newEmployee.save();
    res.status(201).json({ message: `Employee ${name} created successfully!` });

  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error while creating employee.' });
  }
});

// Route: Create an HR Account
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

// ---------------------------------------------------
// READ, UPDATE, DELETE ROUTES (For Modifier Page)
// ---------------------------------------------------

// Route: Get all Employees (Excludes passwords for security)
router.get('/employees', async (req, res) => {
  try {
    const employees = await EmployeeDetails.find().select('-password');
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error while fetching employees.' });
  }
});

// Route: Update an Employee
router.put('/employees/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;

    // If the admin provided a new password, hash it and add it to the update payload
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedEmployee = await EmployeeDetails.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true } // Returns the newly updated document
    ).select('-password');

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee updated successfully!', employee: updatedEmployee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error while updating employee.' });
  }
});

// Route: Delete an Employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const deletedEmployee = await EmployeeDetails.findByIdAndDelete(req.params.id);
    
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error while deleting employee.' });
  }
});

module.exports = router;