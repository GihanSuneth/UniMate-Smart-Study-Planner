const AnalyticsTarget = require('../models/AnalyticsTarget');
const Attendance = require('../models/Attendance');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Quiz = require('../models/Quiz');

// @desc    Set or update weekly target
// @route   POST /api/analytics/target
// @access  Private
exports.setTarget = async (req, res) => {
  const { student, week, attendanceTarget, quizTarget, isLocked, module = 'Overall' } = req.body;
  
  try {
    let target = await AnalyticsTarget.findOne({ student, week, module });

    if (target) {
      if (target.isLocked) {
        return res.status(400).json({ message: 'Targets for this week are already locked.' });
      }
      target.attendanceTarget = attendanceTarget;
      target.quizTarget = quizTarget;
      target.isLocked = isLocked || false;
      await target.save();
    } else {
      target = await AnalyticsTarget.create({
        student,
        week,
        attendanceTarget,
        quizTarget,
        isLocked: isLocked || false,
        module,
      });
    }

    res.status(200).json(target);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics summary for a student
// @route   GET /api/analytics/summary/:studentId/:week
// @access  Private
exports.getAnalyticsSummary = async (req, res) => {
  const { studentId, week } = req.params;
  const { module = 'Overall' } = req.query;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid Student ID format' });
  }

  const currentWeek = parseInt(week);
  const lastWeekNum = currentWeek - 1;

  try {
    // 1. Get current and last week targets for this module
    const currentTarget = await AnalyticsTarget.findOne({ student: studentId, week: currentWeek, module });
    const lastTarget = await AnalyticsTarget.findOne({ student: studentId, week: lastWeekNum, module });

    // 2. Optimized Performance Data: Filter at DB level + module filter
    const attQuery = { student: studentId, week: lastWeekNum };
    const curAttQuery = { student: studentId, week: currentWeek };
    const quizQuery = { student: studentId, week: lastWeekNum };
    const curQuizQuery = { student: studentId, week: currentWeek };

    if (module !== 'Overall') {
      attQuery.module = module;
      curAttQuery.module = module;
      quizQuery.module = module;
      curQuizQuery.module = module;
    }

    const lastWeekAtt = await Attendance.find(attQuery);
    const curWeekAtt = await Attendance.find(curAttQuery);
    
    const lastWeekQuizzes = await QuizAttempt.find(quizQuery);
    const curWeekQuizzes = await QuizAttempt.find(curQuizQuery);
    
    // Calculate Attendance Pct
    const lastWeekAttPct = lastWeekAtt.length > 0 ? (lastWeekAtt.filter(a => a.status === 'Present').length / lastWeekAtt.length) * 100 : 0;
    const curWeekAttPct = curWeekAtt.length > 0 ? (curWeekAtt.filter(a => a.status === 'Present').length / curWeekAtt.length) * 100 : 0;

    // Calculate Quiz Pct
    const lastWeekQuizPct = lastWeekQuizzes.length > 0 ? lastWeekQuizzes.reduce((acc, q) => acc + q.score, 0) / lastWeekQuizzes.length : 0;
    const curWeekQuizPct = curWeekQuizzes.length > 0 ? curWeekQuizzes.reduce((acc, q) => acc + q.score, 0) / curWeekQuizzes.length : 0;

    // 3. Generate Evaluation and Suggestions
    let suggestions = [];
    let status = 'On Track';

    if (lastTarget) {
      if (lastWeekAttPct < lastTarget.attendanceTarget) {
        suggestions.push(`Last week attendance was ${lastTarget.attendanceTarget - lastWeekAttPct}% below target.`);
      }
      if (lastWeekQuizPct < lastTarget.quizTarget) {
        suggestions.push(`Last week quiz score was ${lastTarget.quizTarget - lastWeekQuizPct}% below target.`);
      }
    }

    if (currentTarget && currentTarget.isLocked) {
      if (curWeekAttPct < currentTarget.attendanceTarget) {
        status = 'Needs Attention';
        suggestions.push(`You are currently ${currentTarget.attendanceTarget - curWeekAttPct}% below your current attendance target.`);
      }
    }

    const currentTargetData = currentTarget || { attendanceTarget: 0, quizTarget: 0, isLocked: false };
    const attPassed = curWeekAttPct >= currentTargetData.attendanceTarget;
    const quizPassed = curWeekQuizPct >= currentTargetData.quizTarget;

    const response = {
      lastWeek: {
        attendance: lastWeekAttPct,
        quiz: lastWeekQuizPct,
        target: lastTarget || { attendanceTarget: 0, quizTarget: 0 }
      },
      currentWeek: {
        attendance: curWeekAttPct,
        quiz: curWeekQuizPct,
        target: currentTargetData
      },
      status,
      criticalInsight: {
        text: (attPassed && quizPassed) ? "You're CRUSHING it this week! Keep the pace." : (suggestions[0] || "Set your targets to start tracking performance."),
        type: (attPassed && quizPassed) ? "SPARK" : "WARNING",
        priority: (attPassed && quizPassed) ? "medium" : "high"
      },
      deviation: lastTarget ? {
        attendance: lastWeekAttPct - lastTarget.attendanceTarget,
        quiz: lastWeekQuizPct - lastTarget.quizTarget
      } : null
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get multi-week analytics history for a student
// @route   GET /api/analytics/history/:studentId
// @access  Private
exports.getAnalyticsHistory = async (req, res) => {
  const { studentId } = req.params;
  const { module = 'Overall' } = req.query;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid Student ID format' });
  }

  const maxWeeks = 5;

  try {
    const targetQuery = { student: studentId };
    const attQuery = { student: studentId };
    const quizQuery = { student: studentId };

    if (module !== 'Overall') {
      targetQuery.module = module;
      attQuery.module = module;
      quizQuery.module = module;
    }

    const allTargets = await AnalyticsTarget.find(targetQuery);
    const allAttendance = await Attendance.find(attQuery);
    const allQuizzes = await QuizAttempt.find(quizQuery);

    const history = [];
    
    for (let week = 1; week <= maxWeeks; week++) {
      const target = allTargets.find(t => t.week === week) || { attendanceTarget: 0, quizTarget: 0 };
      
      // OPTIMIZED: Filter already fetched data by week (since we still fetch all for history)
      // but indexed find would be better if maxWeeks was large. 
      // For history, fetching all once is often better than many small queries in a loop.
      const weekAtt = allAttendance.filter(a => a.week === week);
      const attPct = weekAtt.length > 0 ? (weekAtt.filter(a => a.status === 'Present').length / weekAtt.length) * 100 : 0;

      const weekQuizzes = allQuizzes.filter(q => q.week === week);
      const quizPct = weekQuizzes.length > 0 ? weekQuizzes.reduce((acc, q) => acc + q.score, 0) / weekQuizzes.length : 0;

      // Structured AI Insight Engine
      let aiInsight = {
        text: "Keep up the consistent effort! Your progress is steady.",
        type: "SPARK",
        priority: "low"
      };

      if (attPct < target.attendanceTarget) {
        aiInsight = {
          text: `You missed your attendance target by ${(target.attendanceTarget - attPct).toFixed(1)}%. I recommend prioritizing your core modules next week.`,
          type: "WARNING",
          priority: "high"
        };
      } else if (quizPct < target.quizTarget) {
        aiInsight = {
          text: `Your quiz score was ${(target.quizTarget - quizPct).toFixed(1)}% lower than planned. Reviewing database normalization might help improve your average.`,
          type: "ACTION",
          priority: "medium"
        };
      } else if (attPct >= target.attendanceTarget && quizPct >= target.quizTarget) {
        aiInsight = {
          text: "Excellent week! You exceeded both targets. I think you're ready to set slightly higher goals.",
          type: "SPARK",
          priority: "medium"
        };
      }

      history.push({
        week,
        attendance: {
          actual: attPct,
          target: target.attendanceTarget
        },
        quiz: {
          actual: quizPct,
          target: target.quizTarget
        },
        aiInsight
      });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get global stats for Admin Dashboard
// @route   GET /api/analytics/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Student Stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeStudents = await User.countDocuments({ 
      role: 'student', 
      $or: [
        { lastLogin: { $gte: thirtyDaysAgo } },
        { updatedAt: { $gte: thirtyDaysAgo } }
      ]
    });

    // 2. Lecturer Stats
    const totalLecturers = await User.countDocuments({ role: 'Lecturer' });
    const activeLecturers = await User.countDocuments({ 
      role: 'Lecturer', 
      $or: [
        { lastLogin: { $gte: thirtyDaysAgo } },
        { updatedAt: { $gte: thirtyDaysAgo } }
      ]
    });

    // 3. Breakdown by Academic Info for Students
    const studentBreakdown = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { 
          _id: { year: "$academicYear", sem: "$semester" }, 
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $gte: ["$lastLogin", thirtyDaysAgo] }, 1, 0] } }
        } 
      }
    ]);

    // 4. Breakdown by Modules for Lecturers
    const lecturerBreakdown = await User.aggregate([
      { $match: { role: 'Lecturer' } },
      { $unwind: "$assignedModules" },
      { $group: { 
          _id: "$assignedModules", 
          count: { $sum: 1 }
        } 
      }
    ]);

    res.json({
      students: {
        total: totalStudents,
        active: activeStudents,
        breakdown: studentBreakdown
      },
      lecturers: {
        total: totalLecturers,
        active: activeLecturers,
        breakdown: lecturerBreakdown
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get Weekly Learning Report (Integrated Dashboard Stats)
// @route   GET /api/analytics/weekly-report
// @access  Private
exports.getWeeklyLearningReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Get User Modules Scoping
    const user = await User.findById(userId);
    const assignedModules = user.assignedModules || [];

    if (req.user.role === 'Lecturer') {
      // Aggregate for all students in lecturer's modules
      const attendance = await Attendance.find({ 
        module: { $in: assignedModules }, 
        date: { $gte: sevenDaysAgo } 
      });
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const attendancePct = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

      const quizzes = await QuizAttempt.find({
        module: { $in: assignedModules },
        date: { $gte: sevenDaysAgo }
      });
      const avgScore = quizzes.length > 0 ? quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length : 0;

      const notesCount = await Activity.countDocuments({
        module: { $in: assignedModules },
        type: 'notes_generated',
        timestamp: { $gte: sevenDaysAgo }
      });

      return res.json({
        attendance: { overall: attendancePct },
        notes: { frequency: notesCount, status: notesCount > 20 ? 'High' : 'Normal' },
        quiz: { averageScore: avgScore, totalAttempts: quizzes.length }
      });
    }

    // Default: Student View
    const attendance = await Attendance.find({ 
      student: userId, 
      date: { $gte: sevenDaysAgo } 
    });
    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const attendancePct = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

    // Module-wise attendance for students
    const moduleAttendance = assignedModules.map(mod => {
      const modAtt = attendance.filter(a => a.module === mod);
      const modPresent = modAtt.filter(a => a.status === 'Present').length;
      return {
        module: mod,
        percentage: modAtt.length > 0 ? (modPresent / modAtt.length) * 100 : 0
      };
    });

    // 3. Notes AI Activity Frequency
    const activities = await Activity.find({
      user: userId,
      type: 'notes_generated',
      timestamp: { $gte: sevenDaysAgo }
    });
    const notesFrequency = activities.length;

    // 4. Quiz Performance Summary (Last 7 Days)
    const quizzes = await QuizAttempt.find({
      student: userId,
      date: { $gte: sevenDaysAgo }
    });
    const avgScore = quizzes.length > 0 ? quizzes.reduce((acc, q) => acc + q.score, 0) / quizzes.length : 0;

    res.json({
      attendance: {
        overall: attendancePct,
        byModule: moduleAttendance
      },
      notes: {
        frequency: notesFrequency,
        status: notesFrequency >= 3 ? 'High' : notesFrequency >= 1 ? 'Moderate' : 'Low'
      },
      quiz: {
        averageScore: avgScore,
        totalAttempts: quizzes.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Deep Quiz Analysis (Specific failing questions)
// @route   GET /api/analytics/quiz-deep-dive/:module
// @access  Private
exports.getQuizDeepDive = async (req, res) => {
  const { module } = req.params;
  try {
    const filter = { module };
    if (req.user.role === 'student') filter.student = req.user._id;
    // For lecturers, they see all student performance in their module
    
    const attempts = await QuizAttempt.find(filter);
    
    if (attempts.length === 0) {
      return res.json({ message: 'No data for this module', insights: [] });
    }

    // Identify hardest questions
    const questionFailureMap = {}; // questionText -> { fails, total }
    
    attempts.forEach(attempt => {
      attempt.questionResults.forEach(res => {
        if (!questionFailureMap[res.questionText]) {
          questionFailureMap[res.questionText] = { fails: 0, total: 0 };
        }
        questionFailureMap[res.questionText].total++;
        if (!res.isCorrect) questionFailureMap[res.questionText].fails++;
      });
    });

    const failingQuestions = Object.keys(questionFailureMap)
      .map(text => ({
        text,
        failureRate: (questionFailureMap[text].fails / questionFailureMap[text].total) * 100,
        fails: questionFailureMap[text].fails
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 3); // Top 3 hardest

    // Identify high scoring and low scoring subtopics (by quiz title)
    const quizStats = await QuizAttempt.aggregate([
      { $match: filter },
      { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizData' } },
      { $unwind: '$quizData' },
      { $group: {
        _id: '$quizData.title',
        avgScore: { $sum: '$score' },
        count: { $sum: 1 }
      }}
    ]);

    const formattedQuizStats = quizStats.map(s => ({
      title: s._id,
      avgScore: s.avgScore / s.count
    })).sort((a,b) => b.avgScore - a.avgScore);

    res.json({
      hardestQuestions: failingQuestions,
      quizPerformance: formattedQuizStats,
      bestSubtopic: formattedQuizStats[0]?.title || 'N/A',
      worstSubtopic: formattedQuizStats[formattedQuizStats.length - 1]?.title || 'N/A'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI Justification/Explanation for a quiz question
// @route   POST /api/analytics/justify
// @access  Private
exports.getJustification = async (req, res) => {
  const { questionText, correctAnswer } = req.body;
  try {
    // Simulated AI Intelligence Engine for brief justification
    const justifications = [
      "The correct choice aligns with industry best practices for efficiency and system stability.",
      "This fundamental concept is critical for ensuring data integrity in complex systems.",
      "By selecting this option, you ensure that the logic is scalable across multiple environments.",
      "This is the standard approach used in modern framework architectures to minimize latency.",
      "The reasoning behind this is linked to the core principles of academic theory in this module."
    ];
    const justification = justifications[Math.floor(Math.random() * justifications.length)];

    res.json({ 
      explanation: `Correct Answer: "${correctAnswer}". ${justification} Understanding this helps built a stronger foundation for the upcoming modules.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
