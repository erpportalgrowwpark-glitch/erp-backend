// backend/models/EmployeeDetails.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  
  // UPDATED: Now an Array of Strings to hold 5 variations of the face
  referenceFaceImages: { type: [String], default: [] } 
}, { timestamps: true });

module.exports = mongoose.model('EmployeeDetails', employeeSchema);