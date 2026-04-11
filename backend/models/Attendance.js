const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  module: {
    type: String,
    enum: ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true,
  }
}, {
  timestamps: true,
});

// Optimization index for analytics queries
attendanceSchema.index({ student: 1, week: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
