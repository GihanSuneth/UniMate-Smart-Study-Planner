const AnalyticsTarget = require('../models/AnalyticsTarget');
const Attendance = require('../models/Attendance');
const QuizAttempt = require('../models/QuizAttempt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Quiz = require('../models/Quiz');

/**
 * Smart Mock Fallback for Gemini API Quota Limits (429)
 * Generates realistic insights based on provided data when AI is unavailable.
 */
const generateMockInsight = (type, data) => {
  console.log(`[generateMockInsight] Generating simulated ${type} content...`);
  
  if (type === 'attendance_patterns') {
    const avg = data.history.reduce((acc, h) => acc + h.presentCount, 0) / data.history.length;
    return {
      dropOffTrend: avg > 15 ? "Stable" : "Declining",
      patternInsight: `Class participation clusters show ${avg > 20 ? 'exceptional' : 'steady'} early-week engagement. Historical data for ${data.module} suggests attendance peaks on Mondays with minor drop-offs during lab-heavy weeks.`,
      highRiskWindow: "Week 7 (Midterm Period)",
      strongCoverage: `Weeks 1-5 (${avg.toFixed(1)} avg presents)`,
      isSimulated: true
    };
  }

  if (type === 'analytics') {
    const isGood = data.attendance >= 75 && data.quizScore >= 75;
    return {
      weeklyAnalysis: {
        problem: isGood ? "No critical bottlenecks identified." : "Moderate engagement gap detected in core modules.",
        reason: isGood 
          ? "Consistent participation and logical note-taking are reinforcing concepts." 
          : "Slight deviation from study targets likely due to increased module complexity.",
        suggestion: isGood 
          ? "Maintain current momentum. Focus on advanced mastery clusters for coming weeks."
          : "Leverage AI-summarized notes to bridge the 12% comprehension gap observed in recent quizzes."
      },
      riskLevel: isGood ? "Low" : "Medium",
      isSimulated: true
    };
  }

  if (type === 'explanation' || type === 'batch_explanation') {
    return {
      explanation: "SIMULATED BRIEF: The selected answer is logically consistent with the module's core principles. The correct answer highlights the standard industry implementation for this specific scenario.",
      isSimulated: true
    };
  }

  return { message: "Analysis complete.", isSimulated: true };
};

// @desc    Set or update weekly target
// @route   POST /api/analytics/target
// @access  Private
exports.setTarget = async (req, res) => {
  const { student, week, attendanceTarget, quizTarget, isLocked, module } = req.body;
  if (!module) return res.status(400).json({ message: 'Module is required' });
  
  try {
    // Robust ID conversion
    let studentId = null;
    if (student && mongoose.Types.ObjectId.isValid(student)) {
      studentId = new mongoose.Types.ObjectId(student);
    }

    let target = await AnalyticsTarget.findOne({ student: studentId, week, module });

    if (target) {
      // 🔓 Handle Unlock Request
      if (target.isLocked && isLocked === false) {
        if (target.unlockCount >= 2) {
          return res.status(400).json({ message: 'Maximum unlock limit (2) reached for this week.' });
        }
        target.isLocked = false;
        target.unlockCount += 1;
        await target.save();
        return res.status(200).json(target);
      }

      // 🔒 Handle Update/Relock
      if (target.isLocked && isLocked === true) {
        if (target.attendanceTarget === attendanceTarget && target.quizTarget === quizTarget) {
          return res.status(200).json(target);
        }
        return res.status(400).json({ message: 'Targets are already locked.' });
      }

      target.attendanceTarget = attendanceTarget;
      target.quizTarget = quizTarget;
      target.isLocked = isLocked || false;
      await target.save();
    } else {
      target = await AnalyticsTarget.create({
        student: studentId,
        week,
        attendanceTarget,
        quizTarget,
        isLocked: isLocked || false,
        module,
      });
    }

    console.log(`Target saved for week ${week}, module ${module}`);
    res.status(200).json(target);
  } catch (error) {
    console.error("SetTarget Backend Error:", error);
    res.status(500).json({ message: `Backend Validation Error: ${error.message}` });
  }
};

// @desc    Get analytics summary for a student
// @route   GET /api/analytics/summary/:studentId/:week
// @access  Private
exports.getAnalyticsSummary = async (req, res) => {
  const { studentId, week } = req.params;
  const { module = 'Overall' } = req.query;

  console.log(`[getAnalyticsSummary] Fetching summary for student: ${studentId}, week: ${week}, module: ${module}`);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: `Invalid Student ID format: ${studentId}` });
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
    
    // 2.5 Calculate Note Taking Frequency for the week
    const Activity = require('../models/Activity');
    const curWeekActivities = await Activity.find({
      user: studentId,
      type: 'notes_generated',
      timestamp: { 
        $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
      }
    });

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

    const currentTargetData = currentTarget || { attendanceTarget: 0, quizTarget: 0, isLocked: false, unlockCount: 0 };
    
    // Ensure currentTargetData has defaults for aiInsight to prevent undefined crashes in frontend
    if (!currentTargetData.aiInsight) {
      currentTargetData.aiInsight = null;
    }

    const attPassed = curWeekAttPct >= currentTargetData.attendanceTarget;
    const quizPassed = curWeekQuizPct >= currentTargetData.quizTarget;

    const response = {
      lastWeek: {
        attendance: lastWeekAttPct,
        quiz: lastWeekQuizPct,
        target: lastTarget || { attendanceTarget: 0, quizTarget: 0, unlockCount: 0 }
      },
      currentWeek: {
        attendance: curWeekAttPct,
        quiz: curWeekQuizPct,
        target: currentTargetData
      },
      status,
      criticalInsight: currentTargetData.aiInsight || null,
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

// @desc    Generate/Regenerate AI Insight with caching
// @route   POST /api/analytics/generate-ai-insight
// @access  Private
exports.generateAiInsight = async (req, res) => {
  const { role, module, studentId, week, type = 'performance' } = req.body;
  try {
    let aiInsightRaw;

    if (type === 'attendance_patterns') {
      // SPECIALIZED ATTENDANCE PATTERN ANALYSIS
      const history = [];
      for (let w = 1; w <= 12; w++) {
        const attCount = await Attendance.countDocuments({ 
          module: module === 'Overall' ? { $exists: true } : module, 
          week: w,
          status: 'Present'
        });
        history.push({ week: w, presentCount: attCount });
      }

      try {
        aiInsightRaw = await require('../services/gemini.service').generateContent('attendance_patterns', {
          module: module,
          history: history
        });
      } catch (geminiErr) {
        if (geminiErr.message.includes('429') || geminiErr.message.toLowerCase().includes('quota')) {
          aiInsightRaw = generateMockInsight('attendance_patterns', { module, history });
        } else {
          throw geminiErr;
        }
      }

      return res.json(aiInsightRaw);
    }

    // ORIGINAL PERFORMANCE LOGIC
    let target;
    let attPct = 0;
    let quizPct = 0;
    let notesFreq = 0;

    if (role === 'lecturer') {
      // LECTURER PATH: Analyze the whole class
      const allAtt = await Attendance.find({ week, module: module === 'Overall' ? { $exists: true } : module });
      const allQuizzes = await QuizAttempt.find({ week, module: module === 'Overall' ? { $exists: true } : module });
      
      const Activity = require('../models/Activity');
      const allNotes = await Activity.countDocuments({
        type: 'notes_generated',
        timestamp: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      });

      attPct = allAtt.length > 0 ? (allAtt.filter(a => a.status === 'Present').length / allAtt.length) * 100 : 0;
      quizPct = allQuizzes.length > 0 ? allQuizzes.reduce((acc, q) => acc + q.score, 0) / allQuizzes.length : 0;
      notesFreq = allNotes;

      // Caching for lecturer: Link to a module-wide "dummy" target or just return
      target = await AnalyticsTarget.findOne({ student: null, week, module });
      if (!target) {
        target = new AnalyticsTarget({ student: null, week, module, attendanceTarget: 75, quizTarget: 75, isLocked: true });
      }
    } else {
      // STUDENT PATH: Existing individual logic
      target = await AnalyticsTarget.findOne({ student: studentId, week, module });
      
      if (!target) {
        target = new AnalyticsTarget({ 
          student: studentId, 
          week, 
          module: module || 'Overall', 
          attendanceTarget: 75, 
          quizTarget: 75, 
          isLocked: false 
        });
      }

      const curWeekAtt = await Attendance.find({ student: studentId, week, module: (!module || module === 'Overall') ? { $exists: true } : module });
      const curWeekQuizzes = await QuizAttempt.find({ student: studentId, week, module: (!module || module === 'Overall') ? { $exists: true } : module });
      
      const Activity = require('../models/Activity');
      const curWeekActivities = await Activity.find({
        user: studentId,
        type: 'notes_generated',
        timestamp: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
      });

      attPct = curWeekAtt.length > 0 ? (curWeekAtt.filter(a => a.status === 'Present').length / curWeekAtt.length) * 100 : 0;
      quizPct = curWeekQuizzes.length > 0 ? curWeekQuizzes.reduce((acc, q) => acc + q.score, 0) / curWeekQuizzes.length : 0;
      notesFreq = curWeekActivities.length;
    }

    // Call AI for standard performance analytics
    try {
      aiInsightRaw = await require('../services/gemini.service').generateContent('analytics', {
        attendance: attPct.toFixed(0),
        quizScore: quizPct.toFixed(0),
        notesFrequency: notesFreq,
        role: role || 'student',
        module: module,
        weakTopics: 'Analyzed module data'
      });
    } catch (geminiErr) {
      if (geminiErr.message.includes('429') || geminiErr.message.toLowerCase().includes('quota')) {
        aiInsightRaw = generateMockInsight('analytics', { attendance: attPct, quizScore: quizPct });
      } else {
        throw geminiErr;
      }
    }

    const criticalInsight = {
      weeklyAnalysis: aiInsightRaw.weeklyAnalysis,
      type: aiInsightRaw.riskLevel === 'High' ? "WARNING" : (aiInsightRaw.riskLevel === 'Medium' ? "ACTION" : "SPARK"),
      priority: aiInsightRaw.riskLevel === 'High' ? "high" : "medium",
      isSimulated: aiInsightRaw.isSimulated || false
    };

    target.aiInsight = criticalInsight;
    await target.save();

    res.json(criticalInsight);
  } catch (error) {
    console.error("[generateAiInsight] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get multi-week analytics history for a student
// @route   GET /api/analytics/history/:studentId
// @access  Private
exports.getAnalyticsHistory = async (req, res) => {
  const { studentId } = req.params;
  const { module = 'Overall' } = req.query;

  console.log(`[getAnalyticsHistory] Fetching history for student: ${studentId}, module: ${module}`);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: `Invalid Student ID format: ${studentId}` });
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
      const target = allTargets.find(t => t.week === week) || { attendanceTarget: 0, quizTarget: 0, unlockCount: 0 };
      
      // OPTIMIZED: Filter already fetched data by week (since we still fetch all for history)
      // but indexed find would be better if maxWeeks was large. 
      // For history, fetching all once is often better than many small queries in a loop.
      const weekAtt = allAttendance.filter(a => a.week === week);
      const attPct = weekAtt.length > 0 ? (weekAtt.filter(a => a.status === 'Present').length / weekAtt.length) * 100 : 0;

      const weekQuizzes = allQuizzes.filter(q => q.week === week);
      const quizPct = weekQuizzes.length > 0 ? weekQuizzes.reduce((acc, q) => acc + q.score, 0) / weekQuizzes.length : 0;

      // Structured AI Insight Engine
      let aiInsight = target.aiInsight; // Use stored insight if available (from Deploy/Validation)
      
      if (!aiInsight) {
        aiInsight = {
          text: "Keep up the consistent effort! Your progress is steady.",
          type: "SPARK",
          priority: "low"
        };

        if (attPct < target.attendanceTarget) {
          aiInsight = {
            text: `Attendance alert for Week ${week}: You missed your target by ${(target.attendanceTarget - attPct).toFixed(1)}%. Deploy AI Analytics to uncover underlying module-specific patterns.`,
            type: "WARNING",
            priority: "high"
          };
        } else if (quizPct < target.quizTarget) {
          aiInsight = {
            text: `Quiz performance alert: Your average is ${(target.quizTarget - quizPct).toFixed(1)}% below your commitment. Click 'Deploy AI Trace Analysis' to identify specific logic bottlenecks.`,
            type: "ACTION",
            priority: "medium"
          };
        } else if (attPct >= target.attendanceTarget && quizPct >= target.quizTarget) {
          aiInsight = {
            text: `Great work in Week ${week}! Both targets met. Deploy AI Intelligence to see your mastery clusters and potential acceleration steps.`,
            type: "SPARK",
            priority: "medium"
          };
        }
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
  const week = req.query.week ? parseInt(req.query.week) : null;
  
  try {
    const filter = { module };
    if (req.user.role === 'student') filter.student = req.user._id;
    if (week) filter.week = week;
    
    const attempts = await QuizAttempt.find(filter);
    
    // Aggregated Class Patterns
    const Activity = require('../models/Activity');
    const Attendance = require('../models/Attendance');
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    // 1. Class-wide Note taking frequency
    const notesFilter = { module, type: 'notes_generated' };
    if (week) notesFilter.timestamp = { 
      $gte: new Date('2026-03-01').setDate(new Date('2026-03-01').getDate() + (week - 1) * 7),
      $lte: new Date('2026-03-01').setDate(new Date('2026-03-01').getDate() + week * 7)
    };
    else notesFilter.timestamp = { $gte: sevenDaysAgo };

    const classNotes = await Activity.countDocuments(notesFilter);

    // 2. Class-wide Attendance Logic (SYNCED)
    const attFilter = { module, status: 'Present' };
    if (week) attFilter.week = week;
    else attFilter.date = { $gte: sevenDaysAgo };

    const moduleAtt = await Attendance.find(attFilter);
    
    // Use unique students to calculate participation percentage
    const uniquePresentStudents = [...new Set(moduleAtt.map(a => a.student.toString()))].length;
    
    // For demo, assume class size is 25 (matching the user's provided list) or dynamic from User model
    const totalEnrolled = 25; 
    const avgClassAttendance = (uniquePresentStudents / totalEnrolled) * 100;

    // Calculate Average Quiz Score for the week
    const avgScore = attempts.length > 0 
      ? attempts.reduce((acc, q) => acc + q.score, 0) / attempts.length 
      : 0;

    if (attempts.length === 0) {
      return res.json({ 
        message: 'No data for this week/module', 
        insights: [], 
        classStats: { 
          notesFrequency: classNotes, 
          attendance: avgClassAttendance,
          totalEnrolled: totalEnrolled,
          activeNoteTakers: Math.floor(classNotes / 3) // Estimated for demo
        },
        averageScore: 0
      });
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

    const hardestQuestions = Object.keys(questionFailureMap)
      .map(text => ({
        text,
        failureRate: (questionFailureMap[text].fails / questionFailureMap[text].total) * 100,
        fails: questionFailureMap[text].fails
      }))
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 3);

    // 3. Sync Note Taking Patterns for the specific week
    const uniqueNoteTakersFilter = { module, type: 'notes_generated' };
    if (week) {
      const weekStart = new Date('2026-03-01');
      weekStart.setDate(weekStart.getDate() + (week - 1) * 7);
      const weekEnd = new Date('2026-03-01');
      weekEnd.setDate(weekEnd.getDate() + week * 7);
      uniqueNoteTakersFilter.timestamp = { $gte: weekStart, $lte: weekEnd };
    } else {
      uniqueNoteTakersFilter.timestamp = { $gte: sevenDaysAgo };
    }

    const moduleNotes = await Activity.find(uniqueNoteTakersFilter);
    const uniqueNoteTakers = [...new Set(moduleNotes.map(n => n.user.toString()))].length;

    const responseData = {
      module,
      week,
      averageScore: avgScore,
      hardestQuestions,
      classStats: {
        notesFrequency: classNotes,
        activeNoteTakers: uniqueNoteTakers,
        totalEnrolled: 25,
        attendance: avgClassAttendance,
        bestSubtopic: attempts.length > 0 ? 'Core Concepts' : 'N/A'
      }
    };

    // Identify high scoring and low scoring subtopics (by quiz title)
    const quizStats = await QuizAttempt.aggregate([
      { $match: filter },
      { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizData' } },
      { $unwind: '$quizData' },
      { $group: {
        _id: '$quizData.title',
        avgScore: { $sum: '$score' },
        count: { $sum: 1 },
        week: { $first: '$quizData.week' }
      }}
    ]);

    const formattedQuizStats = quizStats.map(s => ({
      title: s._id,
      avgScore: s.avgScore / s.count,
      week: s.week
    })).sort((a,b) => b.week - a.week); // Sort by week DESC (latest first)

    res.json({
      ...responseData,
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
  const { questionText, selectedAnswer, correctAnswer } = req.body;
  try {
    let aiInsightData;
    try {
      aiInsightData = await require('../services/gemini.service').generateContent('explanation', {
        question: questionText,
        selectedAnswer,
        correctAnswer
      });
    } catch (geminiErr) {
      if (geminiErr.message.includes('429') || geminiErr.message.toLowerCase().includes('quota')) {
        aiInsightData = generateMockInsight('explanation', { questionText, selectedAnswer, correctAnswer });
      } else {
        throw geminiErr;
      }
    }

    res.json({ 
      explanation: aiInsightData.explanation || "No explanation available.",
      isSimulated: aiInsightData.isSimulated || false
    });
  } catch (error) {
    console.error("[getJustification] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Batch AI Briefings for all quiz questions
// @route   POST /api/analytics/justify-batch
// @access  Private
exports.getBatchJustification = async (req, res) => {
  const { questions } = req.body;
  try {
    let aiInsightData;
    try {
      aiInsightData = await require('../services/gemini.service').generateContent('batch_explanation', { 
        questions 
      });
    } catch (geminiErr) {
      if (geminiErr.message.includes('429') || geminiErr.message.toLowerCase().includes('quota')) {
        aiInsightData = generateMockInsight('batch_explanation', { questions });
      } else {
        throw geminiErr;
      }
    }

    res.json({ 
      explanations: aiInsightData.explanations || [],
      isSimulated: aiInsightData.isSimulated || false
    });
  } catch (error) {
    console.error("[getBatchJustification] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
