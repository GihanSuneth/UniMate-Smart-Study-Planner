const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  uniqueCode: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true,
});

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
module.exports = AttendanceSession;
