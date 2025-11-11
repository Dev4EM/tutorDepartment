const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  prefix: { type: String, trim: true },

  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: String },

  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  nationality: { type: String },

  workEmail: { type: String, required: true, unique: true, trim: true },
  mobileNumber: { type: String },
  isdCode: { type: Number, default: 91 },

  password: { type: String, required: true },

  employeeCode: { type: String, unique: true, sparse: true },
  dateOfJoining: { type: String },

  employmentType: { type: String },
  employmentStatus: { type: String, default: 'Active' },

  company: { type: String },
  businessUnit: { type: String },
  department: { type: String },
  subDepartment: { type: String },
  designation: { type: String },

  userType: {
    type: String,
    enum: ['employee', 'teamleader', 'admin'],
    default: 'employee',
  },

  reportingManager: { type: String },
  functionalManager: { type: String },

  // Attendance fields
  isPresent: { type: Boolean, default: false },
  lastAttendanceDate: { type: Date },

}, { timestamps: true });

// Password Comparison Method (replace with bcrypt in production)
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return enteredPassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);
