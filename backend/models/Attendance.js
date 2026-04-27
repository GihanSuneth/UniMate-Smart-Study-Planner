const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  module: {
    type: String,
    enum: [
      'Network Design and Modeling', 
      'Database Systems', 
      'Operating Systems', 
      'Data Structures and Algorithms', 
      'Data Science and Analytics',
      'Programming Applications', 
      'Software Engineering' // Keep old ones for safety but prioritized new ones
    ],
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
    enum: ['Present', 'Absent', 'Excused'],
    required: true,
  }
}, {
  timestamps: true,
});

// Optimization index for analytics queries
attendanceSchema.index({ student: 1, week: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
