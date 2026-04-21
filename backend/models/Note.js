const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Can be object (for generated prep) or string
    required: true,
  },
  type: {
    type: String,
    enum: ['teaching_prep', 'draft', 'short_note'],
    default: 'draft',
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Note = mongoose.model('Note', noteSchema);
module.exports = Note;
