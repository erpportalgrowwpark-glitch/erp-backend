// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Required for our auto-seeder

const app = express();

// Middleware
// We are increasing the limit to '10mb' so Base64 images can pass through safely
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Database Connection & Admin Auto-Seeder
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    
    // --- AUTO-SEED ADMIN SCRIPT ---
    const AdminDetails = require('./models/AdminDetails');
    const existingAdmin = await AdminDetails.findOne({ username: 'Admin' });
    
    if (!existingAdmin) {
      console.log('⚠️ No Admin found. Generating default Admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('GrowwPark123', salt);
      
      await AdminDetails.create({
        username: 'Admin',
        password: hashedPassword
      });
      console.log('✅ Default Admin account created successfully!');
    } else {
      console.log('🛡️ Admin account verified.');
    }
    // ------------------------------
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- FEATURE ROUTES ---
// This is where we link the feature files to the main server
const employeeLoginRoute = require('./routes/EmployeeLogin');
app.use('/api/employee-login', employeeLoginRoute);

const hrLoginRoute = require('./routes/HRLogin');
app.use('/api/hr-login', hrLoginRoute);

const adminRoute = require('./routes/Admin');
app.use('/api/admin', adminRoute);

// Admin Login Route
const adminLoginRoute = require('./routes/AdminLogin');
app.use('/api/admin-login', adminLoginRoute);

const attendanceRoute = require('./routes/EmployeeAttendanceManagement');
app.use('/api/attendance', attendanceRoute);

// NEW: Admin Location Manager Route
const locationRoute = require('./routes/AdminLocationManager');
app.use('/api/location', locationRoute);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('ERP Backend is running!');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});