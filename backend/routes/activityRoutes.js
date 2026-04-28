const express = require('express');
const router = express.Router();
const { logActivity, getUserActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, logActivity);
router.get('/', protect, getUserActivity);

module.exports = router;
