const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');

// @desc    Create a new quiz (Draft)
// @route   POST /api/quizzes
// @access  Private/Lecturer
exports.createQuiz = async (req, res) => {
  const { title, module, academicYear, week, questions, questionCount } = req.body;

  try {
    if (questionCount < 5) {
      return res.status(400).json({ message: 'Minimum 5 questions required' });
    }

    const quiz = await Quiz.create({
      title,
      module,
      academicYear,
      week: week || 1,
      lecturer: req.user._id,
      questions,
      questionCount,
      isPublished: false
    });

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for a lecturer or published quizzes for students
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
  const { module } = req.query;
  const filter = {};

  if (module) filter.module = module;

  try {
    if (req.user.role === 'Lecturer' || req.user.role === 'admin') {
      // Lecturers see their own quizzes
      if (req.user.role === 'Lecturer') filter.lecturer = req.user._id;
      const quizzes = await Quiz.find(filter).sort({ dateCreated: -1 });
      res.json(quizzes);
    } else {
      // Students see only published quizzes for their modules
      filter.isPublished = true;
      const quizzes = await Quiz.find(filter).sort({ dateCreated: -1 });
      res.json(quizzes);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Lecturer
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check ownership
    if (quiz.lecturer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish quiz
// @route   PUT /api/quizzes/:id/publish
// @access  Private/Lecturer
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.questions.length < quiz.questionCount) {
      return res.status(400).json({ message: `Need to add ${quiz.questionCount} questions before publishing` });
    }

    quiz.isPublished = true;
    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempt
// @access  Private/Student
exports.submitAttempt = async (req, res) => {
  const { answers, week } = req.body;
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      const studentAnswer = answers[idx]; // { questionIndex: x, selectedOptionIndex: y }
      if (studentAnswer && q.options[studentAnswer.selectedOptionIndex] && q.options[studentAnswer.selectedOptionIndex].isCorrect) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      module: quiz.module,
      week: week || quiz.week || 1, // Use attempt week, then quiz week, then default 1
      score,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Lecturer
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check ownership
    if (quiz.lecturer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
