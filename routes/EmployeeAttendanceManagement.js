// backend/routes/EmployeeAttendanceManagement.js
const express = require('express');
const EmployeeAttendanceDetails = require('../models/EmployeeAttendanceDetails');

const router = express.Router();

// Helper to format ms to "Xh Ym"
const formatTimeDuration = (ms) => {
  if (!ms || ms < 0) return '0h 0m';
  const hrs = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

// --- GET: CHECK STATUS ---
router.get('/status/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; 

    const openSession = await EmployeeAttendanceDetails.findOne({
      employeeId,
      date,
      tapOutTime: { $exists: false } 
    });

    res.status(200).json({ isTappedIn: !!openSession });
  } catch (error) {
    console.error('Check Status Error:', error);
    res.status(500).json({ message: 'Server error checking status.' });
  }
});

// --- GET: DASHBOARD METRICS ---
router.get('/metrics/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; 

    if (!date) return res.status(400).json({ message: 'Date is required.' });

    // 1. Find all records for THIS MONTH
    const currentYearMonth = date.substring(0, 7); 
    const monthlyRecords = await EmployeeAttendanceDetails.find({
      employeeId,
      date: { $regex: `^${currentYearMonth}` }
    });

    // 2. Figure out the start date of "This Week" (Sunday)
    const todayObj = new Date(date);
    const startOfWeekObj = new Date(todayObj);
    startOfWeekObj.setDate(todayObj.getDate() - todayObj.getDay());
    const startOfWeekStr = startOfWeekObj.toISOString().split('T')[0];

    let todayMs = 0;
    let weekMs = 0;
    let monthMs = 0;
    let todayLogs = [];
    
    // NEW: Object to group data per day for the Charts
    let chartDataMap = {};

    monthlyRecords.forEach(record => {
      let duration = 0;
      
      if (record.tapOutTime) {
        duration = new Date(record.tapOutTime) - new Date(record.tapInTime);
      } else if (record.date === date) {
        duration = new Date() - new Date(record.tapInTime);
      }

      monthMs += duration;

      if (record.date >= startOfWeekStr && record.date <= date) {
        weekMs += duration;
      }

      if (record.date === date) {
        todayMs += duration;
        todayLogs.push({
          in: record.tapInTime,
          out: record.tapOutTime || null
        });
      }

      // Group data for the charts
      if (!chartDataMap[record.date]) {
        chartDataMap[record.date] = { date: record.date, workMs: 0, tapIns: [] };
      }
      chartDataMap[record.date].workMs += duration;
      chartDataMap[record.date].tapIns.push(new Date(record.tapInTime));
    });

    // Calculate Delay per day (Target time: 9:35 AM = 575 minutes)
    const chartData = Object.values(chartDataMap).map(day => {
      // Find the absolute first tap in of the day
      const firstTap = new Date(Math.min(...day.tapIns));
      const inMins = (firstTap.getHours() * 60) + firstTap.getMinutes();
      
      // If tapped in after 9:35 AM, calculate the delay in ms
      const delayMins = Math.max(0, inMins - 575); 
      const delayMs = delayMins * 60000;

      return {
        date: day.date,
        workMs: day.workMs,
        delayMs: delayMs
      };
    }).sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    res.status(200).json({
      today: formatTimeDuration(todayMs),
      week: formatTimeDuration(weekMs),
      month: formatTimeDuration(monthMs),
      logs: todayLogs,
      chartData: chartData // Send the raw MS chart data to React
    });

  } catch (error) {
    console.error('Metrics Error:', error);
    res.status(500).json({ message: 'Server error fetching metrics.' });
  }
});

// --- GET: FULL DETAILED HISTORY ---
router.get('/history/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await EmployeeAttendanceDetails.find({ employeeId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ message: 'Server error fetching detailed history.' });
  }
});

// --- POST: TAP IN ---
router.post('/tap-in', async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const openSession = await EmployeeAttendanceDetails.findOne({ employeeId, date, tapOutTime: { $exists: false } });
    
    if (openSession) return res.status(400).json({ message: 'You are already tapped in.' });

    const newRecord = new EmployeeAttendanceDetails({ employeeId, date, tapInTime: new Date() });
    await newRecord.save();
    res.status(200).json({ message: 'Tapped in successfully!' });
  } catch (error) {
    console.error('Tap In Error:', error);
    res.status(500).json({ message: 'Server error during tap in.' });
  }
});

// --- POST: TAP OUT ---
router.post('/tap-out', async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const openSession = await EmployeeAttendanceDetails.findOne({ employeeId, date, tapOutTime: { $exists: false } });

    if (!openSession) return res.status(404).json({ message: 'You are not currently tapped in.' });

    openSession.tapOutTime = new Date(); 
    await openSession.save();
    res.status(200).json({ message: 'Tapped out successfully!' });
  } catch (error) {
    console.error('Tap Out Error:', error);
    res.status(500).json({ message: 'Server error during tap out.' });
  }
});

module.exports = router;