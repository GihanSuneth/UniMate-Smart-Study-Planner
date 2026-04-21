const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  submitAttempt,
  getStudentAttempts,
  getModuleAttempts,
  generateAiQuiz,
  deleteQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createQuiz)
  .get(protect, getQuizzes);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

router.put('/:id/publish', protect, publishQuiz);
router.post('/:id/attempt', protect, submitAttempt);
router.get('/attempts/history', protect, getStudentAttempts);
router.get('/attempts/module/:moduleCode', protect, getModuleAttempts);
router.post('/generate-ai', protect, generateAiQuiz);

module.exports = router;
