const mongoose = require('mongoose');

const analyticsTargetSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  attendanceTarget: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  quizTarget: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  isLocked: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Compound index to ensure uniqueness per student per week
analyticsTargetSchema.index({ student: 1, week: 1 }, { unique: true });

const AnalyticsTarget = mongoose.model('AnalyticsTarget', analyticsTargetSchema);
module.exports = AnalyticsTarget;
