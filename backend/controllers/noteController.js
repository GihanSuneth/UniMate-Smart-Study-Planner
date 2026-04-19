const Note = require('../models/Note');

// @desc    Create/Save a note
// @route   POST /api/notes
// @access  Private
exports.saveNote = async (req, res) => {
  const { title, module, content, type } = req.body;
  try {
    const note = await Note.create({
      user: req.user._id,
      title,
      module,
      content,
      type
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notes for the user
// @route   GET /api/notes
// @access  Private
exports.getNotes = async (req, res) => {
  const { module, type } = req.query;
  const filter = { user: req.user._id };
  if (module && module !== 'All') filter.module = module;
  if (type) filter.type = type;

  try {
    const notes = await Note.find(filter).sort({ timestamp: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
