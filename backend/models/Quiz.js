const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
    enum: ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'],
  },
  academicYear: {
    type: String,
    required: true,
  },
  week: {
    type: Number,
    required: true,
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [{
    text: String,
    options: [{
      text: String,
      isCorrect: Boolean
    }]
  }],
  questionCount: {
    type: Number,
    min: 5,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
  },
  concept: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true,
});

// Index for efficient searching by module and date
quizSchema.index({ module: 1, dateCreated: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
