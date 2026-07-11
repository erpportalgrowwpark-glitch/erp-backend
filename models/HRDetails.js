// backend/models/HRDetails.js
const mongoose = require('mongoose');

const hrSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'hr' }
}, { timestamps: true });

module.exports = mongoose.model('HRDetails', hrSchema);