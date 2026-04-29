const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['notes_generated', 'pdf_downloaded'],
    required: true,
  },
  generatorMode: {
    type: String,
    enum: ['smart_notes', 'exam_prep'],
  },
  module: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

activitySchema.index({ user: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
