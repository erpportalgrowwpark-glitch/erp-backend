// backend/routes/AdminLocationManager.js
const express = require('express');
const AdminDetails = require('../models/AdminDetails');

const router = express.Router();

// --- POST: Set the Official Office Location (Used by Admin) ---
router.post('/set-location', async (req, res) => {
  try {
    const { latitude, longitude, allowedRadius } = req.body;
    
    // Find the master admin account to attach the settings to
    const admin = await AdminDetails.findOne({ role: 'superadmin' });
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found.' });
    }

    // Update and save the location
    admin.officeLocation = { latitude, longitude, allowedRadius };
    await admin.save();
    
    res.status(200).json({ message: 'Office GPS location updated successfully!' });
  } catch (error) {
    console.error('Error setting location:', error);
    res.status(500).json({ message: 'Server error while setting location.' });
  }
});

// --- GET: Fetch the Official Office Location (Used by Employee Dashboard) ---
router.get('/get-location', async (req, res) => {
  try {
    const admin = await AdminDetails.findOne({ role: 'superadmin' });
    
    // Check if the admin actually set a location yet
    if (!admin || !admin.officeLocation || !admin.officeLocation.latitude) {
      return res.status(404).json({ message: 'Office location has not been configured by Admin yet.' });
    }

    res.status(200).json({ officeLocation: admin.officeLocation });
  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({ message: 'Server error while getting location.' });
  }
});

module.exports = router;