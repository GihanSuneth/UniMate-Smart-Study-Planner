const express = require('express');
const router = express.Router();
const { setTarget, getAnalyticsSummary, getAnalyticsHistory, getAdminStats, getWeeklyLearningReport, getQuizDeepDive, getJustification } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/weekly-report', protect, getWeeklyLearningReport);
router.get('/quiz-deep-dive/:module', protect, getQuizDeepDive);
router.post('/target', protect, setTarget);
router.post('/justify', protect, getJustification);
router.get('/summary/:studentId/:week', getAnalyticsSummary);
router.get('/history/:studentId', getAnalyticsHistory);
router.get('/admin/stats', protect, admin, getAdminStats);

module.exports = router;
