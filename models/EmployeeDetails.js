// backend/models/EmployeeDetails.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // CORE FIELDS (Required)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  referenceFaceImages: { type: [String], default: [] },

  // PERSONAL & CONTACT INFO (Optional)
  empId: { type: String, default: '' },
  title: { type: String, default: '' },
  firstName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  gender: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  maritalStatus: { type: String, default: '' },
  marriageDate: { type: String, default: '' },
  fatherHusbandName: { type: String, default: '' },
  nationality: { type: String, default: '' },
  workEmail: { type: String, default: '' },
  personalEmail: { type: String, default: '' },
  workPhone: { type: String, default: '' },
  personalPhoneNumber: { type: String, default: '' },
  mobile: { type: String, default: '' },

  // IDENTITY
  aadharNumber: { type: String, default: '' },
  nameAsPerAadhar: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  nameAsPerPan: { type: String, default: '' },

  // EMPLOYMENT DETAILS
  startDate: { type: String, default: '' },
  company: { type: String, default: '' },
  companyEffectiveDate: { type: String, default: '' },
  department: { type: String, default: '' },
  departmentEffectiveDate: { type: String, default: '' },
  jobRole: { type: String, default: '' },
  grade: { type: String, default: '' },
  jobRoleEffectiveDate: { type: String, default: '' },
  jobRoleReason: { type: String, default: '' },
  reportsTo: { type: String, default: '' },
  reportsToEffectiveDate: { type: String, default: '' },
  location: { type: String, default: '' },
  locationEffectiveDate: { type: String, default: '' },
  employmentType: { type: String, default: '' },
  employmentTypeEffectiveDate: { type: String, default: '' },
  probationEndDate: { type: String, default: '' },
  noticePeriod: { type: String, default: '' },
  fixedTermEndDate: { type: String, default: '' },
  nextReviewDate: { type: String, default: '' },
  leavingDate: { type: String, default: '' },
  leaveReason: { type: String, default: '' },

  // LEAVE & ATTENDANCE
  annualLeaveEntitlement: { type: String, default: '' },
  earnedLeaveBalanceThisYear: { type: String, default: '' },
  earnedLeaveAddedNextYear: { type: String, default: '' },
  entitlementType: { type: String, default: '' },
  biometricId: { type: String, default: '' },
  workPatternName: { type: String, default: '' },
  effectiveDate: { type: String, default: '' },
  currentWeek: { type: String, default: '' },

  // ADDRESSES
  currentAddressLine1: { type: String, default: '' },
  currentAddressLine2: { type: String, default: '' },
  currentAddressLine3: { type: String, default: '' },
  currentState: { type: String, default: '' },
  currentCountry: { type: String, default: '' },
  currentPostCode: { type: String, default: '' },
  permanentAddressLine1: { type: String, default: '' },
  permanentAddressLine2: { type: String, default: '' },
  permanentAddressLine3: { type: String, default: '' },
  permanentState: { type: String, default: '' },
  permanentCountry: { type: String, default: '' },
  permanentPostCode: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeDetails', employeeSchema);