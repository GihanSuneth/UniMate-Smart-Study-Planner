const express = require('express');
const router = express.Router();
const { setTarget, getAnalyticsSummary, getAnalyticsHistory } = require('../controllers/analyticsController');

router.post('/target', setTarget);
router.get('/summary/:studentId/:week', getAnalyticsSummary);
router.get('/history/:studentId', getAnalyticsHistory);

module.exports = router;
