const AnalyticsTarget = require('../models/AnalyticsTarget');
const Attendance = require('../models/Attendance');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');
const User = require('../models/User');

// @desc    Set or update weekly target
// @route   POST /api/analytics/target
// @access  Private
exports.setTarget = async (req, res) => {
  const { student, week, attendanceTarget, quizTarget, isLocked } = req.body;

  try {
    let target = await AnalyticsTarget.findOne({ student, week });

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

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid Student ID format' });
  }

  const currentWeek = parseInt(week);
  const lastWeekNum = currentWeek - 1;

  try {
    // 1. Get current and last week targets
    const currentTarget = await AnalyticsTarget.findOne({ student: studentId, week: currentWeek });
    const lastTarget = await AnalyticsTarget.findOne({ student: studentId, week: lastWeekNum });

    // 2. Optimized Performance Data: Filter at DB level
    const lastWeekAtt = await Attendance.find({ student: studentId, week: lastWeekNum });
    const curWeekAtt = await Attendance.find({ student: studentId, week: currentWeek });
    
    const lastWeekQuizzes = await QuizAttempt.find({ student: studentId, week: lastWeekNum });
    const curWeekQuizzes = await QuizAttempt.find({ student: studentId, week: currentWeek });
    
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

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid Student ID format' });
  }

  const maxWeeks = 5;

  try {
    const allTargets = await AnalyticsTarget.find({ student: studentId });
    const allAttendance = await Attendance.find({ student: studentId });
    const allQuizzes = await QuizAttempt.find({ student: studentId });

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
