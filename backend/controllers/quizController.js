const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const geminiService = require('../services/gemini.service');
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
      isPublished: false,
      deadline: req.body.deadline
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
  const { module, academicYear, week } = req.query;
  const filter = {};

  if (module && module !== 'All') filter.module = module;
  if (academicYear && academicYear !== 'All') {
    // If it contains "All", we might want to just filter by the part that isn't "All"
    // e.g. "Year 1 All" -> regex "Year 1"
    const cleanYear = academicYear.replace(/All/g, '').trim();
    if (cleanYear) {
      filter.academicYear = { $regex: cleanYear, $options: 'i' };
    }
  }
  if (week && week !== 'All') {
    const weekNum = parseInt(week);
    if (!isNaN(weekNum)) filter.week = weekNum;
  }

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
  const { password } = req.body;
  try {
    if (!password) {
      return res.status(400).json({ message: 'Security re-confirmation required: Password is missing.' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Verify password
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Publishing aborted.' });
    }

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

    // Check deadline
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ message: 'Quiz deadline has passed. You can no longer submit attempts.' });
    }

    let correctCount = 0;
    const questionResults = [];
    quiz.questions.forEach((q, idx) => {
      const studentAnswer = answers[idx]; // { questionIndex: x, selectedOptionIndex: y }
      const selectedOpt = studentAnswer && q.options[studentAnswer.selectedOptionIndex];
      const isCorrect = selectedOpt && selectedOpt.isCorrect;
      if (isCorrect) correctCount++;
      
      questionResults.push({
        questionText: q.text,
        selectedText: selectedOpt ? selectedOpt.text : 'No Answer',
        isCorrect: !!isCorrect
      });
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      module: quiz.module,
      week: week || quiz.week || 1, // Use attempt week, then quiz week, then default 1
      score,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length,
      questionResults
    });

    const responseData = attempt.toObject();
    responseData.correctCount = correctCount; // Alias for frontend compatibility
    res.status(201).json(responseData);
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

// @desc    Get student's quiz attempts history
// @route   GET /api/quizzes/attempts/history
// @access  Private/Student
exports.getStudentAttempts = async (req, res) => {
  const { module } = req.query;
  const filter = { student: req.user._id };
  if (module) filter.module = module;

  try {
    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title')
      .sort({ date: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all attempts for a specific module (Lecturer View)
// @route   GET /api/quizzes/attempts/module/:moduleCode
// @access  Private/Lecturer
exports.getModuleAttempts = async (req, res) => {
  const { moduleCode } = req.params;
  try {
    const attempts = await QuizAttempt.find({ module: moduleCode })
      .populate('student', 'username email portalId')
      .populate('quiz', 'title')
      .sort({ date: -1 });

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Quiz using AI
// @route   POST /api/quizzes/generate-ai
// @access  Private/Lecturer
exports.generateAiQuiz = async (req, res) => {
  const { module, week, count, concept } = req.body;
  
  if (!module) return res.status(400).json({ message: 'Module is required' });

  try {
    const generatedData = await geminiService.generateContent('quiz', { 
      module, 
      week: week || 1, 
      count: count || 5,
      concept
    });

    console.log("DEBUG: AI Data for Quiz:", JSON.stringify(generatedData).substring(0, 500));

    // Flexible extraction logic
    let questionsRaw = [];
    if (Array.isArray(generatedData)) {
      questionsRaw = generatedData;
    } else if (generatedData.questions && Array.isArray(generatedData.questions)) {
      questionsRaw = generatedData.questions;
    } else if (generatedData.quiz && Array.isArray(generatedData.quiz)) {
      questionsRaw = generatedData.quiz;
    } else if (generatedData.data && Array.isArray(generatedData.data)) {
      questionsRaw = generatedData.data;
    }

    if (questionsRaw.length === 0) {
      return res.status(500).json({ message: 'AI returned an invalid data structure. Please try again.' });
    }

    // Format for frontend: Gemini returns [{question, options, correctAnswer}]
    // Scavenge for varied keys (question/text/qText and options/choices/answers)
    const formattedQuestions = questionsRaw
      .map(q => {
        const questionText = q.question || q.text || q.title || q.qText;
        const optionsList = q.options || q.choices || q.answers;
        const correctAns = q.correctAnswer || q.correct || q.answer;

        if (!questionText || !Array.isArray(optionsList)) return null;

        return {
          text: questionText,
          options: optionsList.map(opt => ({
            text: String(opt),
            isCorrect: String(opt).trim().toLowerCase() === String(correctAns || "").trim().toLowerCase()
          }))
        };
      })
      .filter(q => q !== null && q.options.some(o => o.isCorrect));

    if (formattedQuestions.length === 0) {
      return res.status(500).json({ message: 'AI returned questions but they could not be mapped to the required format. Please refine your concept and try again.' });
    }

    res.json(formattedQuestions);
  } catch (error) {
    console.error("AI Quiz Gen Error:", error);
    const status = error.message.includes('429') ? 429 : 500;
    res.status(status).json({ message: error.message });
  }
};
