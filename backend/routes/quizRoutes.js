const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  submitAttempt,
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

module.exports = router;
