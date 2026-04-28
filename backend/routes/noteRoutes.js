const express = require('express');
const router = express.Router();
const { saveNote, getNotes, deleteNote, deployInsight } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, saveNote);
router.get('/', protect, getNotes);
router.post('/deploy-insight', protect, deployInsight);
router.delete('/:id', protect, deleteNote);

module.exports = router;
