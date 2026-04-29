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
  deleteQuiz,
  getJustification,
  getBatchJustification
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createQuiz)
  .get(protect, getQuizzes);

router.post('/justify', protect, getJustification);
router.post('/justify-batch', protect, getBatchJustification);

router.route('/:id')
  .get(protect, getQuizById)
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

router.put('/:id/publish', protect, publishQuiz);
router.post('/:id/attempt', protect, submitAttempt);

module.exports = router;
