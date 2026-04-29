const express = require('express');
const router = express.Router();
const { setTarget, getAnalyticsSummary, getAnalyticsHistory, getAdminStats, getWeeklyLearningReport, getQuizDeepDive, generateAiInsight } = require('../controllers/analyticsController');
const { getJustification, getBatchJustification } = require('../controllers/quizController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/weekly-report', protect, getWeeklyLearningReport);
router.get('/quiz-deep-dive/:module', protect, getQuizDeepDive);
router.post('/target', protect, setTarget);
router.post('/justify', protect, getJustification);
router.post('/justify-batch', protect, getBatchJustification);
router.post('/generate-ai-insight', protect, generateAiInsight);
router.get('/summary/:studentId/:week', protect, getAnalyticsSummary);
router.get('/history/:studentId', protect, getAnalyticsHistory);
router.get('/admin/stats', protect, admin, getAdminStats);

module.exports = router;
