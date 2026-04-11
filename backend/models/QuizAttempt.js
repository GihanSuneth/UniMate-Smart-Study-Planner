const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
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
    default: Date.now
  },
  week: {
    type: Number,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
});

// Optimization index for analytics queries
quizAttemptSchema.index({ student: 1, week: 1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
module.exports = QuizAttempt;
