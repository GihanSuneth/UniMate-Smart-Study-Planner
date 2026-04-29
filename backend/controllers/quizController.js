const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');

// Quiz Controller

// Escape user search text before turning it into a regex filter.
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Create a new quiz (Draft)
// @route   POST /api/quizzes
// @access  Private/Lecturer
exports.createQuiz = async (req, res) => {
  const { title, module, academicYear, week, questions, questionCount, concept } = req.body;

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
      concept: concept || null,
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
  const { module } = req.query;
  const filter = {};

  if (module && module !== 'All') filter.module = module;
  if (academicYear && academicYear !== 'All') {
    // Some UI values combine year/semester text, so trim the generic "All"
    // token before building the regex.
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
      // Lecturers see their own quizzes, while admins can see the full set.
      if (req.user.role === 'Lecturer') filter.lecturer = req.user._id;
      const quizzes = await Quiz.find(filter).sort({ dateCreated: -1 });
      res.json(quizzes);
    } else {
      // Students should never receive draft quizzes.
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

    // Attempts are blocked once the configured deadline has passed.
    if (quiz.deadline && new Date() > new Date(quiz.deadline)) {
      return res.status(400).json({ message: 'Quiz deadline has passed. You can no longer submit attempts.' });
    }

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      // Each answer points to an option index from the submitted payload.
      const studentAnswer = answers[idx];
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
      // Keep a week value on the attempt itself so history and analytics do not
      // depend on the quiz document alone.
      week: week || quiz.week || 1,
      score,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length
    });

    const responseData = attempt.toObject();
    responseData.correctCount = correctCount; // Alias kept for existing UI code
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
  const { studentId, quizTitle, module, week } = req.query;

  try {
    const filter = {};
    const selectedModule = module && module !== 'All' ? module : moduleCode;

    // Module remains optional so the same route can power exact-module views and
    // broader search behaviour.
    if (selectedModule && selectedModule !== 'All') {
      filter.module = selectedModule;
    }

    // Week lives on the attempt, so it can be filtered directly here.
    if (week && week !== 'All') {
      const weekNum = Number(week);
      if (!Number.isNaN(weekNum)) filter.week = weekNum;
    }

    // Student ID search accepts portal ID, username, email, or raw ObjectId so
    // lecturers can find records using whichever identifier they know.
    if (studentId && studentId.trim()) {
      const search = studentId.trim();
      const regex = new RegExp(escapeRegex(search), 'i');
      const studentMatch = [{ portalId: regex }, { username: regex }, { email: regex }];

      if (mongoose.Types.ObjectId.isValid(search)) {
        studentMatch.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      const students = await User.find({ $or: studentMatch }).select('_id').lean();
      if (!students.length) return res.json([]);
      filter.student = { $in: students.map(student => student._id) };
    }

    // Quiz title belongs to the quiz document, so map title matches to quiz ids
    // before querying attempts.
    if (quizTitle && quizTitle.trim()) {
      const titleRegex = new RegExp(escapeRegex(quizTitle.trim()), 'i');
      const quizzes = await Quiz.find({ title: titleRegex }).select('_id').lean();
      if (!quizzes.length) return res.json([]);
      filter.quiz = { $in: quizzes.map(quiz => quiz._id) };
    }

    const attempts = await QuizAttempt.find(filter)
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

    // Accept a few likely response shapes so the frontend is resilient to small
    // AI formatting differences.
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

    // Normalize the AI output into the quiz schema expected by the frontend and
    // database model.
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

// @desc    Get AI explanation for one quiz answer
// @route   POST /api/quizzes/justify
// @access  Private
exports.getJustification = async (req, res) => {
  const { questionText, selectedAnswer, correctAnswer } = req.body;

  try {
    const aiInsightData = await geminiService.generateContent('explanation', {
      question: questionText,
      selectedAnswer,
      correctAnswer
    });

    res.json({
      explanation: aiInsightData.explanation || 'No explanation available.',
      isSimulated: aiInsightData.isSimulated || false
    });
  } catch (error) {
    console.error('[getJustification] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI explanations for multiple quiz answers
// @route   POST /api/quizzes/justify-batch
// @access  Private
exports.getBatchJustification = async (req, res) => {
  const { questions } = req.body;

  try {
    const aiInsightData = await geminiService.generateContent('batch_explanation', { questions });

    res.json({
      explanations: aiInsightData.explanations || [],
      isSimulated: aiInsightData.isSimulated || false
    });
  } catch (error) {
    console.error('[getBatchJustification] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
