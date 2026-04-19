const express = require('express');
const router = express.Router();
const { saveNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveNote);
router.get('/', protect, getNotes);
router.delete('/:id', protect, deleteNote);

module.exports = router;
