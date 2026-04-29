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
      strongCoverage: `Weeks 1-5 (${avg.toFixed(2)} avg presents)`,
      isSimulated: true
    };
  }

  if (type === 'analytics') {
    const att = data?.attendance ?? 100;
    const quiz = data?.quiz ?? 54.67;
    const notes = data?.notes ?? 8;
    const module = data?.module ?? 'this module';
    const gap = (att - quiz).toFixed(2);
    const projected = Math.max(quiz - 8.5, 30).toFixed(2);
    const bloomsLayer = quiz < 50 ? 'Comprehension' : quiz < 65 ? 'Application' : 'Synthesis';
    const riskLevel = quiz < 55 ? 'CRITICAL' : quiz < 70 ? 'MODERATE' : 'LOW';

    const MODULE_INTEL = {
      'Network Design and Modeling': {
        diagnostic: 'Trace what happens to BGP routes when a peering link fails — no notes. Can you describe the path change?',
        fix: 'Draw a 3-router OSPF topology on paper. Kill one link manually and trace the reconvergence. Your notes are not allowed — the topology must come from memory.',
        validate: 'Justify your routing protocol selection for a dual-ISP network to a peer. If they follow your logic — gap cleared.'
      },
      'Database Systems': {
        diagnostic: 'Write a 3-table JOIN (students → enrollments → courses) from memory. Can you explain why LEFT JOIN returns different rows than INNER JOIN?',
        fix: 'Draw a normalised 3NF schema from scratch for a university system. Then write 5 queries using JOIN, WHERE, and GROUP BY without any reference.',
        validate: 'Write the query. Correct output from memory = gap cleared. Wrong = your gap is at the normalization node, not the SQL syntax node.'
      },
      'Operating Systems': {
        diagnostic: 'Trace the complete lifecycle of a process from fork() to zombie state — no reference material. Where do you get stuck?',
        fix: 'Manually calculate a Round Robin schedule for 5 processes (quantum=3) on paper. Every step must have a reason — not just algorithm output.',
        validate: 'Calculate average waiting time correctly. If you cannot — your gap is at the scheduling algorithm node, not the process state node.'
      },
      'Data Structures and Algorithms': {
        diagnostic: 'Write a binary search tree insertion from memory. Then trace a deletion with 2 children — what replaces the deleted node and why?',
        fix: 'Implement merge sort and quicksort on paper with a sample array of 8 elements. Derive time complexity from the steps — not from memory of the formula.',
        validate: 'Run your written algorithm against a new array. If the output is correct — gap cleared. If not — your gap is at the recursion boundary.'
      },
      'Data Science and Analytics': {
        diagnostic: 'Explain the difference between variance and bias — then give one real-world consequence of a high-bias model vs a high-variance model.',
        fix: 'Write out a complete linear regression workflow: data cleaning → feature engineering → training → evaluation. No notes. Use a concrete dataset scenario.',
        validate: 'Describe your model selection reasoning for a classification problem to a peer. If they are convinced — gap cleared.'
      }
    };

    const intel = MODULE_INTEL[module] || {
      diagnostic: `Close your notes. Explain the core mechanism of ${module} aloud and give a real-world failure scenario.`,
      fix: `Rebuild your weakest concept in ${module} from memory only. Map the cause-effect logic — not the definition.`,
      validate: 'Re-attempt the quiz. Target ≥70% before the next lecture.'
    };

    return {
      weeklyAnalysis: {
        problem: `Behavioral Gap Detected: ${att.toFixed(2)}% engagement, ${quiz.toFixed(2)}% output — ${gap}% synthesis gap.`,
        reason: `UniMate AI classified your failure layer as: ${bloomsLayer.toUpperCase()}. You note ${notes}x/week but your scores indicate knowledge is stored, not operable. At this rate, Week 6 is projected to drop to ${projected}%.`,
        suggestion: `🔍 DIAGNOSTIC: ${intel.diagnostic}\n\n🛠️ MANDATORY FIX: ${intel.fix}\n\n✅ VALIDATION: ${intel.validate}`
      },
      riskLevel,
      bloomsLayer,
      synthesisGap: gap,
      projectedWeek6: projected,
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
        attendance: attPct.toFixed(2),
        quizScore: quizPct.toFixed(2),
        notesFrequency: notesFreq,
        role: role || 'student',
        module: module,
        weakTopics: 'Analyzed module data'
      });
    } catch (geminiErr) {
      if (geminiErr.message.includes('429') || geminiErr.message.toLowerCase().includes('quota')) {
        aiInsightRaw = generateMockInsight('analytics', { attendance: attPct, quiz: quizPct, notes: notesFreq, module });
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
            text: `Attendance alert for Week ${week}: You missed your target by ${(target.attendanceTarget - attPct).toFixed(2)}%. Deploy AI Analytics to uncover underlying module-specific patterns.`,
            type: "WARNING",
            priority: "high"
          };
        } else if (quizPct < target.quizTarget) {
          aiInsight = {
            text: `Quiz performance alert: Your average is ${(target.quizTarget - quizPct).toFixed(2)}% below your commitment. Click 'Deploy AI Trace Analysis' to identify specific logic bottlenecks.`,
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
    
    const attempts = await QuizAttempt.find(filter).populate('quiz', 'concept title');
    
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

    // 🚀 NEW: Weighted Topic Mission Logic
    const topicImpactMap = {}; // topic -> { weightedFails, totalSeen, difficultyImpact }

    // Module-aware sub-topic detector.
    // Each module has its own keyword namespace so "dijkstra" means Routing Protocols
    // in NDM context but Graph Algorithms in a DS context.
    // Returns null if no specific sub-topic matched — quiz.concept is then used as fallback.
    const getGranularTopic = (text, mod) => {
      const t = text.toLowerCase();
      const m = (mod || '').toLowerCase();

      // ── Network Design & Modeling ──────────────────────────────
      if (m.includes('network')) {
        if (t.includes('routing') || t.includes('ospf') || t.includes('bgp') || t.includes('rip') || t.includes('dijkstra') || t.includes('shortest path') || t.includes('route table') || t.includes('convergence')) return 'Routing Protocols';
        if (t.includes('subnet') || t.includes('ip address') || t.includes('cidr') || t.includes('nat') || t.includes('ipv4') || t.includes('ipv6') || t.includes('host range') || t.includes('broadcast')) return 'IP Addressing';
        if (t.includes('ttl') || t.includes('packet') || t.includes('bandwidth') || t.includes('throughput') || t.includes('latency') || t.includes('qos') || t.includes('congestion')) return 'Traffic Engineering';
        if (t.includes('topology') || t.includes('osi') || t.includes('layer') || t.includes('encapsulat') || t.includes('protocol stack') || t.includes('network') || t.includes('graph') || t.includes('vertex') || t.includes('edge')) return 'Network Architecture';
        return null;
      }

      // ── Database Systems ────────────────────────────────────────
      if (m.includes('database')) {
        if (t.includes('join') || t.includes('select') || t.includes('where') || t.includes('group by') || t.includes('aggregate') || t.includes('subquery') || t.includes('sql')) return 'SQL & Query Logic';
        if (t.includes('normal') || t.includes('1nf') || t.includes('2nf') || t.includes('3nf') || t.includes('schema') || t.includes('erd') || t.includes('entity') || t.includes('relation') || t.includes('foreign key') || t.includes('primary key')) return 'Schema Design';
        if (t.includes('transaction') || t.includes('acid') || t.includes('rollback') || t.includes('commit') || t.includes('concurren') || t.includes('deadlock') || t.includes('isolation')) return 'Transaction Management';
        if (t.includes('index') || t.includes('query optim') || t.includes('execution plan') || t.includes('b-tree')) return 'Query Optimization';
        return null;
      }

      // ── Operating Systems ───────────────────────────────────────
      if (m.includes('operating')) {
        if (t.includes('schedul') || t.includes('round robin') || t.includes('fcfs') || t.includes('sjf') || t.includes('cpu burst') || t.includes('waiting time') || t.includes('turnaround')) return 'CPU Scheduling';
        if (t.includes('page') || t.includes('virtual memory') || t.includes('segment') || t.includes('tlb') || t.includes('page fault') || t.includes('frame') || t.includes('swap')) return 'Memory Management';
        if (t.includes('mutex') || t.includes('semaphore') || t.includes('sync') || t.includes('critical section') || t.includes('race condition') || t.includes('monitor')) return 'Synchronisation';
        if (t.includes('process') || t.includes('thread') || t.includes('fork') || t.includes('pcb') || t.includes('context switch') || t.includes('zombie') || t.includes('process state')) return 'Process Management';
        return null;
      }

      // ── Data Structures & Algorithms ────────────────────────────
      if (m.includes('data structure') || m.includes('algorithm')) {
        if (t.includes('sort') || t.includes('merge sort') || t.includes('quicksort') || t.includes('bubble') || t.includes('heap sort') || t.includes('insertion sort')) return 'Sorting Algorithms';
        if (t.includes('tree') || t.includes('bst') || t.includes('avl') || t.includes('binary tree') || t.includes('traversal') || t.includes('inorder') || t.includes('preorder')) return 'Tree Structures';
        if (t.includes('graph') || t.includes('bfs') || t.includes('dfs') || t.includes('dijkstra') || t.includes('vertex') || t.includes('adjacen') || t.includes('shortest path')) return 'Graph Algorithms';
        if (t.includes('dynamic programming') || t.includes(' dp ') || t.includes('memoiz') || t.includes('recurrence') || t.includes('knapsack')) return 'Dynamic Programming';
        if (t.includes('array') || t.includes('linked list') || t.includes('stack') || t.includes('queue') || t.includes('hash') || t.includes('heap')) return 'Linear Data Structures';
        return null;
      }

      // ── Data Science & Analytics ────────────────────────────────
      if (m.includes('data science') || m.includes('analytics')) {
        if (t.includes('regression') || t.includes('classification') || t.includes('model') || t.includes('predict') || t.includes('feature') || t.includes('training')) return 'Machine Learning';
        if (t.includes('statistic') || t.includes('mean') || t.includes('variance') || t.includes('distribution') || t.includes('hypothesis') || t.includes('p-value')) return 'Statistical Analysis';
        if (t.includes('pandas') || t.includes('numpy') || t.includes('dataframe') || t.includes('preprocessing') || t.includes('clean') || t.includes('missing')) return 'Data Preprocessing';
        return null;
      }

      return null; // Unknown module — let quiz.concept handle it
    };

    attempts.forEach(attempt => {
      // Difficulty weight: harder quizzes (lower scores) expose more critical gaps
      const difficultyWeight = attempt.score > 80 ? 1.0 : (attempt.score > 50 ? 2.0 : 3.0);
      
      attempt.questionResults.forEach(res => {
        // Priority: 1) Module-aware sub-topic keyword  2) Stored quiz concept
        // Skip if no specific topic identified — generic labels are not actionable
        const topic = getGranularTopic(res.questionText, attempt.module) || attempt.quiz?.concept;
        if (!topic) return; // No specific blocker identified for this question
        if (!topicImpactMap[topic]) {
          topicImpactMap[topic] = { weightedFails: 0, totalSeen: 0, actualFails: 0 };
        }
        topicImpactMap[topic].totalSeen++;
        if (!res.isCorrect) {
          topicImpactMap[topic].weightedFails += difficultyWeight;
          topicImpactMap[topic].actualFails++;
        }
      });
    });

    // TOPIC INTEL MAP — dependency-aware AI protocols per topic
    const TOPIC_INTEL = {
      'Network Architecture': {
        patternInsights: [
          'Layer diagrams are present in notes but Layer 3+ questions fail in quizzes',
          'Pattern: visual memorisation without functional understanding of inter-layer handoff',
          "Bloom's gap: Comprehension — you know WHAT each layer does, not WHY data must pass through it"
        ],
        dependencyChain: ['Physical Layer', 'Data Link', 'Network Layer', 'Transport', 'Application'],
        pinpointQuestion: 'Take a real HTTP request. At which layer can you no longer explain what happens to the actual data?',
        fix: 'Trace ONE real request (e.g., loading a website) through all layers on paper — what header or address is added at each step. No notes.',
        validate: 'Answer: "What does Layer 4 add that Layer 3 cannot do, and why does TCP exist?" If you hesitate — Layer 3/4 boundary is your study node.'
      },
      'Relational Logic': {
        patternInsights: [
          'SQL syntax is present in notes but multi-table query logic fails consistently',
          'Pattern: table-by-table thinking instead of relational set-based thinking',
          'Gap located at the Normalization → JOIN transition — schema design is incomplete'
        ],
        dependencyChain: ['Entity Model', 'Relationship Design', 'Normalization (1NF→3NF)', 'Table Schema', 'SQL Syntax', 'JOIN Logic'],
        pinpointQuestion: 'Write a 3-table JOIN (students → enrollments → courses) from memory. Can you explain WHY LEFT JOIN vs INNER JOIN produces different rows?',
        fix: 'Draw a 3-table ER diagram from scratch. Write the JOIN query that connects all three. Run it mentally against sample data — no notes.',
        validate: 'Write the query correctly from memory = gap cleared. Wrong output = your gap is at the normalization node, not the SQL syntax node.'
      },
      'System Internals': {
        patternInsights: [
          'Process state diagrams are present in notes but scheduling calculations fail',
          'Pattern: memorising state names without understanding the transition triggers',
          "Bloom's gap: Analysis — you know the states but cannot trace WHY a process transitions"
        ],
        dependencyChain: ['Process States', 'PCB Structure', 'Scheduling Algorithms', 'Context Switch', 'Synchronisation', 'Deadlock Conditions'],
        pinpointQuestion: 'Without notes, calculate the waiting time for 4 processes using Round Robin (quantum=3). At which step do you get stuck?',
        fix: 'Simulate a manual execution timeline on paper for 4 processes. Every step must have a justification — not just algorithm output.',
        validate: 'Calculate average waiting time correctly. If you cannot — your gap is at the scheduling node, not the process state node.'
      },
      'Algorithmic Thinking': {
        patternInsights: [
          'Algorithm names are memorised but time complexity derivations fail',
          'Pattern: copying pseudocode without understanding the recursion boundary',
          "Bloom's gap: you can recite the algorithm but cannot trace it on a new input"
        ],
        dependencyChain: ['Recursion Fundamentals', 'Sorting Algorithms', 'Tree Traversal', 'Graph Search', 'Dynamic Programming'],
        pinpointQuestion: 'Write a binary search tree insertion from memory. Then trace a deletion with 2 children — what replaces the deleted node and why?',
        fix: 'Implement merge sort on paper with a sample array of 8 elements. Derive the time complexity from your own steps — not from memorising O(n log n).',
        validate: 'Run your written algorithm against a new array. Correct output = gap cleared. Wrong = your gap is at the recursion boundary.'
      },
      // — Database sub-topic entries —
      'SQL & Query Logic': {
        patternInsights: [
          'SQL syntax is present in notes but multi-table queries fail under test conditions',
          'Pattern: writing single-table SELECTs but unable to construct JOIN conditions correctly',
          "Bloom's gap: you know SQL keywords but cannot build a query that produces correct results"
        ],
        dependencyChain: ['Table Structure', 'WHERE Filtering', 'JOIN Types', 'Aggregation', 'Subqueries'],
        pinpointQuestion: 'Write a query: return all students who scored above 70 — joining Students, Enrollments, and Scores tables. At which step do you get stuck?',
        fix: 'Take any 3-table schema from your notes. Write 5 queries manually — one for each JOIN type. Verify the expected output row by row on paper.',
        validate: 'Execute your JOIN query mentally against sample data. Correct output row count = gap cleared.'
      },
      'Schema Design': {
        patternInsights: [
          'ER diagrams are drawn but normalization rules are not applied correctly',
          'Pattern: tables are designed with redundant columns indicating 1NF/2NF violations',
          "Bloom's gap: you know normalization terms but cannot apply the rules to restructure a schema"
        ],
        dependencyChain: ['Entity Identification', 'Relationship Mapping', '1NF Rules', '2NF Rules', '3NF Rules', 'Schema Validation'],
        pinpointQuestion: 'Given a table with StudentID, CourseID, CourseName, LecturerName — is it in 3NF? What violates it and how do you fix it?',
        fix: 'Take one unnormalized table from your notes. Decompose it step-by-step through 1NF → 2NF → 3NF on paper. No reference allowed.',
        validate: 'Show your decomposed schema to a peer. If they agree it is in 3NF — gap cleared. If not — identify which normal form rule you applied incorrectly.'
      },
      'Transaction Management': {
        patternInsights: [
          'ACID properties are memorised as acronyms but not understood as guarantees',
          'Pattern: knowing that transactions exist but failing to apply isolation levels correctly',
          "Bloom's gap: Application — you know the terms but cannot identify a transaction anomaly in a scenario"
        ],
        dependencyChain: ['Atomicity', 'Consistency', 'Isolation Levels', 'Durability', 'Deadlock Detection'],
        pinpointQuestion: 'Two transactions T1 and T2 both read and update the same row. Which isolation level prevents a dirty read? What anomaly does READ COMMITTED still allow?',
        fix: 'Write out a timeline of T1 and T2 executing concurrently. Mark where a dirty read, non-repeatable read, and phantom read would occur. No notes.',
        validate: 'Correctly identify the anomaly type for 3 concurrent transaction scenarios. All 3 correct = gap cleared.'
      },
      // — Network sub-topic entries —
      'Routing Protocols': {
        patternInsights: [
          'Protocol names are memorised but selection criteria under real network conditions fail',
          'Pattern: reciting OSPF/BGP definitions but unable to determine which to use in a given topology',
          "Bloom's gap: Application — protocol knowledge is static, not decision-based"
        ],
        dependencyChain: ['Static Routes', 'Distance Vector (RIP)', 'Link State (OSPF)', 'Path Vector (BGP)', 'Protocol Selection'],
        pinpointQuestion: 'You are designing a 3-site enterprise network connected to 2 ISPs. Which protocol runs internally? Which at the ISP border? Why not OSPF at the border?',
        fix: 'Draw a 2-AS network on paper. Label every protocol zone. Justify one routing decision with the protocol\'s specific limitation — not its name.',
        validate: 'Defend your protocol selection to a peer under questioning. If they cannot break your reasoning — gap cleared.'
      },
      'IP Addressing': {
        patternInsights: [
          'IP address classes are memorised but subnetting calculations fail under time pressure',
          'Pattern: knowing CIDR notation but unable to determine usable host ranges from a subnet mask',
          "Bloom's gap: Comprehension → Application — notation is known but calculation is not automatic"
        ],
        dependencyChain: ['Binary Representation', 'IP Classes', 'Subnet Masks', 'CIDR Notation', 'Usable Host Calculation', 'NAT Design'],
        pinpointQuestion: 'Given 192.168.10.0/26 — what is the broadcast address? How many usable hosts? At which step do you get stuck?',
        fix: 'Subnet 10.0.0.0/8 into /24 blocks on paper. Calculate network address, broadcast, and usable range for 3 subnets without a calculator.',
        validate: 'Complete subnetting for a given /22 block. All calculations correct = gap cleared.'
      },
      // — OS sub-topic entries —
      'CPU Scheduling': {
        patternInsights: [
          'Scheduling algorithm names are known but Gantt chart construction fails',
          'Pattern: knowing Round Robin exists but unable to calculate waiting time correctly',
          "Bloom's gap: Analysis — you know algorithms exist but cannot trace their execution on a real process set"
        ],
        dependencyChain: ['Process States', 'Arrival Time / Burst Time', 'FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'],
        pinpointQuestion: 'Given 4 processes with burst times [5, 3, 8, 2] arriving at t=0 — calculate average waiting time using Round Robin (quantum=2). Where do you get stuck?',
        fix: 'Draw the Gantt chart manually for those 4 processes. Calculate waiting time for each process. Every step must be justified.',
        validate: 'Calculate correctly for a new set of 5 processes using RR and SJF. All calculations accurate = gap cleared.'
      },
      'Process Management': {
        patternInsights: [
          'Process state diagrams are present but transition triggers are not understood',
          'Pattern: knowing "Ready → Running" exists but unable to explain what causes each transition',
          "Bloom's gap: Comprehension — states are memorised as labels, not as system-triggered conditions"
        ],
        dependencyChain: ['New → Ready', 'Ready → Running', 'Running → Waiting', 'Waiting → Ready', 'Running → Terminated'],
        pinpointQuestion: 'A process in Running state calls read() on a file. Trace every state transition from that point until the process finishes. At which transition do you hesitate?',
        fix: 'Trace 3 processes through their lifecycle on paper. Every arrow must have a trigger (e.g. "I/O request", "scheduler preemption") — not just a label.',
        validate: 'Trace a new process through 5 state transitions. All triggers correct = gap cleared.'
      },
      // — Data Structures sub-topic entries —
      'Sorting Algorithms': {
        patternInsights: [
          'Algorithm names and Big-O are memorised but manual execution fails',
          'Pattern: writing "O(n log n)" without being able to trace the recursive splits',
          "Bloom's gap: you know the complexity but cannot derive it from the algorithm's steps"
        ],
        dependencyChain: ['Bubble Sort (base)', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort'],
        pinpointQuestion: 'Sort [8, 3, 1, 5, 2] using Merge Sort. Draw every recursive split and merge step. At which recursion depth do you get confused?',
        fix: 'Manually trace Merge Sort and Quick Sort on a 6-element array. Derive the number of comparisons from your trace — not from memory.',
        validate: 'Sort a new 7-element array using Quick Sort (pivot = last element). Correct final array and comparison count = gap cleared.'
      },
      'Tree Structures': {
        patternInsights: [
          'BST insertion is known but deletion with 2 children fails consistently',
          'Pattern: understanding the concept of a tree but unable to maintain BST property after structural changes',
          "Bloom's gap: Application — tree operations are known in isolation but not composed under constraints"
        ],
        dependencyChain: ['Binary Tree Properties', 'BST Search', 'BST Insertion', 'BST Deletion (leaf)', 'BST Deletion (2 children)', 'AVL Balancing'],
        pinpointQuestion: 'In a BST, delete the node with value 50 (which has two children). What replaces it and why? Draw the tree before and after.',
        fix: 'Build a BST from [45, 20, 60, 10, 35, 50, 70]. Delete 45. Show every step of in-order successor selection and tree restructuring.',
        validate: 'Delete 3 nodes (including one with 2 children) from a given BST. Tree properties valid after each deletion = gap cleared.'
      }
    };

    const missions = Object.keys(topicImpactMap)
      .map(topic => {
        const rawScore = (topicImpactMap[topic].weightedFails / (topicImpactMap[topic].totalSeen * 3)) * 100;
        const intel = TOPIC_INTEL[topic] || {
          patternInsights: [
            `High failure rate detected on ${topic} questions`,
            'Pattern: surface-level engagement without deep conceptual processing',
            "Bloom's gap: stored knowledge is not being applied under exam conditions"
          ],
          dependencyChain: ['Foundation Concepts', 'Core Principles', 'Applied Logic', 'Problem Solving'],
          pinpointQuestion: `At which node in the ${topic} dependency chain do you lose confidence?`,
          fix: `Rebuild the core logic of ${topic} from memory only. Map cause-effect relationships — not definitions.`,
          validate: 'Re-attempt quiz questions on this topic. Target ≥70% to clear the blocker.'
        };
        return {
          topic,
          blockerScore: Math.min(rawScore, 100),
          actualFailureRate: (topicImpactMap[topic].actualFails / topicImpactMap[topic].totalSeen) * 100,
          status: topicImpactMap[topic].weightedFails > 2 ? 'Foundation Blocker' : 'Minor Gap',
          intel
        };
      })
      .filter(m => m.actualFailureRate > 0 && m.topic !== 'Core Concepts') // only real concept gaps
      .sort((a, b) => b.blockerScore - a.blockerScore)
      .slice(0, 3); // up to 3 specific topic blockers per week

    // 🚀 NEW: Mastery Accelerators Logic
    const accelerators = Object.keys(topicImpactMap)
      .map(topic => ({
        topic,
        masteryScore: 100 - ((topicImpactMap[topic].actualFails / topicImpactMap[topic].totalSeen) * 100)
      }))
      .filter(a => a.masteryScore > 85)
      .sort((a, b) => b.masteryScore - a.masteryScore)
      .slice(0, 2);

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
      missions,
      accelerators,
      classStats: {
        notesFrequency: classNotes,
        activeNoteTakers: uniqueNoteTakers,
        totalEnrolled: 25,
        attendance: avgClassAttendance,
        bestSubtopic: attempts.length > 0 ? 'Core Concepts' : 'N/A'
      }
    };

    // ── Class-wide Topic Failure Map (used by Lecturer view) ──────────────────
    const topicFailureRaw = {};
    attempts.forEach(attempt => {
      attempt.questionResults.forEach(res => {
        const topic = getGranularTopic(res.questionText, module) || attempt.quiz?.concept;
        if (!topic) return;
        if (!topicFailureRaw[topic]) topicFailureRaw[topic] = { total: 0, failed: 0, students: new Set() };
        topicFailureRaw[topic].total++;
        if (!res.isCorrect) {
          topicFailureRaw[topic].failed++;
          topicFailureRaw[topic].students.add(attempt.student.toString());
        }
      });
    });
    const topicFailureSummary = Object.entries(topicFailureRaw)
      .map(([topic, v]) => ({
        topic,
        failureRate: v.total > 0 ? (v.failed / v.total) * 100 : 0,
        studentsAffected: v.students.size,
        severity: (v.failed / v.total) > 0.6 ? 'Critical' : (v.failed / v.total) > 0.4 ? 'Warning' : 'Monitor'
      }))
      .filter(t => t.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate);

    // ── Hardest Questions — rebuilt from questionResults (accurate) ─────────
    const questionFailMap = {};
    attempts.forEach(attempt => {
      const quizTitle = attempt.quiz?.title || 'Unknown Quiz';
      const quizDate  = attempt.createdAt || attempt.date || null;
      attempt.questionResults.forEach(res => {
        const key = res.questionText;
        if (!questionFailMap[key]) questionFailMap[key] = { total: 0, failed: 0, quizTitle, quizDate };
        questionFailMap[key].total++;
        if (!res.isCorrect) questionFailMap[key].failed++;
      });
    });
    const hardestQuestions = Object.entries(questionFailMap)
      .map(([text, v]) => ({
        text,
        failureRate: v.total > 0 ? (v.failed / v.total) * 100 : 0,
        quizTitle: v.quizTitle,
        quizDate: v.quizDate
      }))
      .filter(q => q.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 3);

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
      topicFailureSummary,
      hardestQuestions,
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
