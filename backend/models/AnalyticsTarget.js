const mongoose = require('mongoose');

const analyticsTargetSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  },
  module: {
    type: String,
    default: 'Overall'
  },
  unlockCount: {
    type: Number,
    default: 0
  },
  aiInsight: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true,
});

// Compound index to ensure uniqueness per student per week per module
analyticsTargetSchema.index({ student: 1, week: 1, module: 1 }, { unique: true });

const AnalyticsTarget = mongoose.model('AnalyticsTarget', analyticsTargetSchema);
module.exports = AnalyticsTarget;
