// backend/routes/EmployeeAttendanceManagement.js
const express = require('express');
const EmployeeAttendanceDetails = require('../models/EmployeeAttendanceDetails');
const EmployeeDetails = require('../models/EmployeeDetails');

const router = express.Router();

const formatTimeDuration = (ms) => {
  if (!ms || ms < 0) return '0h 0m';
  const hrs = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hrs}h ${mins}m`;
};

router.get('/status/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; 
    const openSession = await EmployeeAttendanceDetails.findOne({
      employeeId, date, tapOutTime: { $exists: false } 
    });
    res.status(200).json({ isTappedIn: !!openSession });
  } catch (error) {
    res.status(500).json({ message: 'Server error checking status.' });
  }
});

router.get('/metrics/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; 

    if (!date) return res.status(400).json({ message: 'Date is required.' });

    const currentYearMonth = date.substring(0, 7); 
    const monthlyRecords = await EmployeeAttendanceDetails.find({
      employeeId, date: { $regex: `^${currentYearMonth}` }
    });

    const todayObj = new Date(date);
    const startOfWeekObj = new Date(todayObj);
    startOfWeekObj.setDate(todayObj.getDate() - todayObj.getDay());
    const startOfWeekStr = startOfWeekObj.toISOString().split('T')[0];

    let todayMs = 0; let weekMs = 0; let monthMs = 0; let todayLogs = []; let chartDataMap = {};

    monthlyRecords.forEach(record => {
      let duration = 0;
      if (record.tapOutTime) duration = new Date(record.tapOutTime) - new Date(record.tapInTime);
      else if (record.date === date) duration = new Date() - new Date(record.tapInTime);

      monthMs += duration;
      if (record.date >= startOfWeekStr && record.date <= date) weekMs += duration;

      if (record.date === date) {
        todayMs += duration;
        todayLogs.push({ in: record.tapInTime, out: record.tapOutTime || null });
      }

      if (!chartDataMap[record.date]) chartDataMap[record.date] = { date: record.date, workMs: 0, tapIns: [] };
      chartDataMap[record.date].workMs += duration;
      chartDataMap[record.date].tapIns.push(new Date(record.tapInTime));
    });

    const chartData = Object.values(chartDataMap).map(day => {
      const firstTap = new Date(Math.min(...day.tapIns));
      const inMins = (firstTap.getHours() * 60) + firstTap.getMinutes();
      const delayMins = Math.max(0, inMins - 575); 
      return { date: day.date, workMs: day.workMs, delayMs: delayMins * 60000 };
    }).sort((a, b) => a.date.localeCompare(b.date)); 

    res.status(200).json({
      today: formatTimeDuration(todayMs), week: formatTimeDuration(weekMs),
      month: formatTimeDuration(monthMs), logs: todayLogs, chartData: chartData 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching metrics.' });
  }
});

router.get('/history/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await EmployeeAttendanceDetails.find({ employeeId }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching detailed history.' });
  }
});

router.post('/tap-in', async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const openSession = await EmployeeAttendanceDetails.findOne({ employeeId, date, tapOutTime: { $exists: false } });
    if (openSession) return res.status(400).json({ message: 'You are already tapped in.' });

    const newRecord = new EmployeeAttendanceDetails({ employeeId, date, tapInTime: new Date() });
    await newRecord.save();
    res.status(200).json({ message: 'Tapped in successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during tap in.' });
  }
});

router.post('/tap-out', async (req, res) => {
  try {
    const { employeeId, date } = req.body;
    const openSession = await EmployeeAttendanceDetails.findOne({ employeeId, date, tapOutTime: { $exists: false } });
    if (!openSession) return res.status(404).json({ message: 'You are not currently tapped in.' });

    openSession.tapOutTime = new Date(); 
    await openSession.save();
    res.status(200).json({ message: 'Tapped out successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during tap out.' });
  }
});

router.get('/admin/overview', async (req, res) => {
  try {
    const { month } = req.query; 
    if (!month) return res.status(400).json({ message: 'Month query parameter is required.' });

    const employees = await EmployeeDetails.find({ role: 'employee' }).select('_id name');
    const records = await EmployeeAttendanceDetails.find({ date: { $regex: `^${month}` } });

    const overviewData = employees.map(emp => {
      const empRecords = records.filter(r => r.employeeId.toString() === emp._id.toString());
      const days = {};
      empRecords.forEach(record => {
        if (!days[record.date]) days[record.date] = [];
        days[record.date].push({
          id: record._id, 
          in: record.tapInTime,
          out: record.tapOutTime || null
        });
      });
      return { employeeId: emp._id, name: emp.name, attendance: days };
    });

    res.status(200).json(overviewData);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching attendance overview.' });
  }
});

// ---------------------------------------------------
// UPDATED: ADMIN RECORD MODIFICATION ROUTES (TIMEZONE FIX)
// ---------------------------------------------------

router.put('/admin/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { newInTime, newOutTime } = req.body; // Expects ISO strings from frontend

    const record = await EmployeeAttendanceDetails.findById(recordId);
    if (!record) return res.status(404).json({ message: 'Record not found.' });

    if (newInTime) record.tapInTime = new Date(newInTime);
    if (newOutTime) record.tapOutTime = new Date(newOutTime);
    else record.tapOutTime = undefined;

    await record.save();
    res.status(200).json({ message: 'Record updated successfully.' });
  } catch (error) {
    console.error('Update Record Error:', error);
    res.status(500).json({ message: 'Server error updating record.' });
  }
});

router.delete('/admin/record/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const deletedRecord = await EmployeeAttendanceDetails.findByIdAndDelete(recordId);
    if (!deletedRecord) return res.status(404).json({ message: 'Record not found.' });
    res.status(200).json({ message: 'Record deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting record.' });
  }
});

module.exports = router;