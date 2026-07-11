// backend/models/AdminDetails.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'superadmin' },
  
  // NEW: Store the official office GPS boundaries
  officeLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    allowedRadius: { type: Number, default: 50 } // Default to 50 meters
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminDetails', adminSchema);