// backend/models/EmployeeAttendanceDetails.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Links directly to the employee who is logging in
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmployeeDetails', 
    required: true 
  },
  
  // We'll store the date as a simple string like '2023-10-27' 
  // This makes it super easy to check if they already tapped in "today"
  date: { 
    type: String, 
    required: true 
  },
  
  // The exact date and time they clicked "Tap In"
  tapInTime: { 
    type: Date, 
    required: true 
  },
  
  // The exact date and time they clicked "Tap Out"
  // Notice this is NOT required, because it's empty until they leave!
  tapOutTime: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeAttendanceDetails', attendanceSchema);