const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, aiController.processAIRequest);

module.exports = router;
