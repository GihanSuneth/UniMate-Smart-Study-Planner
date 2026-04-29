const mongoose = require('mongoose');
const AnalyticsTarget = require('../models/AnalyticsTarget');
const Attendance = require('../models/Attendance');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Analytics Controller

// Helper Functions

// Check whether a string is a valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Convert string id to ObjectId only when needed
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

// Get a standard "7 days ago" timestamp
const getSevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// Calculate attendance percentage from attendance records
const calcAttPct = (records) => {
  if (!records.length) return 0;
  const present = records.filter(r => r.status === 'Present').length;
  return (present / records.length) * 100;
};

// Calculate average numeric field from an array
const calcAvg = (records, key = 'score') => {
  if (!records.length) return 0;
  return records.reduce((sum, item) => sum + (item[key] || 0), 0) / records.length;
};

// Add module filter only when module is not "Overall"
const withModule = (query, module) =>
  module && module !== 'Overall' ? { ...query, module } : query;

// Used where "Overall" should mean "all modules"
const moduleFilter = (module) =>
  !module || module === 'Overall' ? { $exists: true } : module;

// Topic Detection For Quiz Analysis

// This helper tries to convert raw question text into a more meaningful topic.
// It helps produce better analytics for weak areas.
const getGranularTopic = (text = '', module = '') => {
  const t = text.toLowerCase();
  const m = module.toLowerCase();

  if (m.includes('network')) {
    if (t.includes('routing') || t.includes('ospf') || t.includes('bgp')) return 'Routing Protocols';
    if (t.includes('subnet') || t.includes('ip address')) return 'IP Addressing';
    if (t.includes('topology') || t.includes('osi')) return 'Network Architecture';
  }

  if (m.includes('database')) {
    if (t.includes('join') || t.includes('select')) return 'SQL & Query Logic';
    if (t.includes('normal') || t.includes('schema')) return 'Schema Design';
    if (t.includes('transaction') || t.includes('acid')) return 'Transaction Management';
  }

  if (m.includes('operating')) {
    if (t.includes('schedul') || t.includes('round robin')) return 'CPU Scheduling';
    if (t.includes('process') || t.includes('thread')) return 'Process Management';
  }

  if (m.includes('data structure') || m.includes('algorithm')) {
    if (t.includes('sort') || t.includes('merge sort')) return 'Sorting Algorithms';
    if (t.includes('tree') || t.includes('bst')) return 'Tree Structures';
  }

  return null;
};

// setTarget

// Create or update a weekly attendance/quiz target for a student
exports.setTarget = async (req, res) => {
  const { student, week, attendanceTarget, quizTarget, isLocked, module } = req.body;

  // Module is required because targets are module-specific
  if (!module) return res.status(400).json({ message: 'Module is required' });

  try {
    const studentId = student && isValidId(student) ? toObjectId(student) : null;
    let target = await AnalyticsTarget.findOne({ student: studentId, week, module });

    // If no target exists, create it directly
    if (!target) {
      target = await AnalyticsTarget.create({
        student: studentId,
        week,
        attendanceTarget,
        quizTarget,
        isLocked: !!isLocked,
        module
      });
      return res.status(200).json(target);
    }

    // If target is locked and user wants to unlock it, allow only 2 unlocks max
    if (target.isLocked && isLocked === false) {
      if (target.unlockCount >= 2) {
        return res.status(400).json({ message: 'Maximum unlock limit (2) reached for this week.' });
      }

      target.isLocked = false;
      target.unlockCount += 1;
      await target.save();
      return res.status(200).json(target);
    }

    // If already locked and same values are sent, return existing target
    if (target.isLocked && isLocked === true) {
      if (
        target.attendanceTarget === attendanceTarget &&
        target.quizTarget === quizTarget
      ) {
        return res.status(200).json(target);
      }

      // If locked and values are different, reject modification
      return res.status(400).json({ message: 'Targets are already locked.' });
    }

    // Normal editable update path
    target.attendanceTarget = attendanceTarget;
    target.quizTarget = quizTarget;
    target.isLocked = !!isLocked;
    await target.save();

    res.status(200).json(target);
  } catch (error) {
    res.status(500).json({ message: `Backend Validation Error: ${error.message}` });
  }
};

// getAnalyticsSummary

// Compare current week and previous week performance for a student
exports.getAnalyticsSummary = async (req, res) => {
  const { studentId, week } = req.params;
  const { module = 'Overall' } = req.query;

  if (!isValidId(studentId)) {
    return res.status(400).json({ message: `Invalid Student ID format: ${studentId}` });
  }

  const currentWeek = Number(week);
  const lastWeekNum = currentWeek - 1;

  try {
    // These queries do not depend on each other, so run them in parallel
    const [
      currentTarget,
      lastTarget,
      lastWeekAtt,
      curWeekAtt,
      lastWeekQuizzes,
      curWeekQuizzes
    ] = await Promise.all([
      AnalyticsTarget.findOne({ student: studentId, week: currentWeek, module }).lean(),
      AnalyticsTarget.findOne({ student: studentId, week: lastWeekNum, module }).lean(),
      Attendance.find(withModule({ student: studentId, week: lastWeekNum }, module)).lean(),
      Attendance.find(withModule({ student: studentId, week: currentWeek }, module)).lean(),
      QuizAttempt.find(withModule({ student: studentId, week: lastWeekNum }, module)).lean(),
      QuizAttempt.find(withModule({ student: studentId, week: currentWeek }, module)).lean()
    ]);

    const lastWeekAttPct = calcAttPct(lastWeekAtt);
    const curWeekAttPct = calcAttPct(curWeekAtt);
    const lastWeekQuizPct = calcAvg(lastWeekQuizzes, 'score');
    const curWeekQuizPct = calcAvg(curWeekQuizzes, 'score');

    let status = 'On Track';
    const suggestions = [];

    // Compare last week's actual results with last week's target
    if (lastTarget) {
      if (lastWeekAttPct < lastTarget.attendanceTarget) {
        suggestions.push(`Last week attendance was ${lastTarget.attendanceTarget - lastWeekAttPct}% below target.`);
      }
      if (lastWeekQuizPct < lastTarget.quizTarget) {
        suggestions.push(`Last week quiz score was ${lastTarget.quizTarget - lastWeekQuizPct}% below target.`);
      }
    }

    // If current target is locked and attendance is below target, raise status
    if (currentTarget?.isLocked) {
      if (curWeekAttPct < currentTarget.attendanceTarget) {
        status = 'Needs Attention';
        suggestions.push(`You are currently ${currentTarget.attendanceTarget - curWeekAttPct}% below your current attendance target.`);
      }
    }

    const currentTargetData = currentTarget || {
      attendanceTarget: 0,
      quizTarget: 0,
      isLocked: false,
      unlockCount: 0
    };

    if (!currentTargetData.aiInsight) currentTargetData.aiInsight = null;

    res.json({
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
      deviation: lastTarget
        ? {
            attendance: lastWeekAttPct - lastTarget.attendanceTarget,
            quiz: lastWeekQuizPct - lastTarget.quizTarget
          }
        : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// generateAiInsight

// Generate AI-driven analytics insight and store it in the target record
exports.generateAiInsight = async (req, res) => {
  const { role, module, studentId, week, type = 'performance' } = req.body;

  try {
    let aiInsightRaw;

    // Special case: attendance pattern analysis across 12 weeks
    if (type === 'attendance_patterns') {
      // Use aggregation instead of 12 separate queries for better performance
      const grouped = await Attendance.aggregate([
        {
          $match: {
            module: moduleFilter(module),
            week: { $gte: 1, $lte: 12 },
            status: 'Present'
          }
        },
        {
          $group: {
            _id: '$week',
            presentCount: { $sum: 1 }
          }
        }
      ]);

      const weekMap = new Map(grouped.map(item => [item._id, item.presentCount]));
      const history = Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        presentCount: weekMap.get(i + 1) || 0
      }));

      aiInsightRaw = await geminiService.generateContent('attendance_patterns', { module, history });
      return res.json(aiInsightRaw);
    }

    let target;
    let attPct = 0;
    let quizPct = 0;
    let notesFreq = 0;

    if (role === 'lecturer') {
      // Lecturer view: calculate module-wide stats for the selected week
      const mod = moduleFilter(module);

      const [allAtt, allQuizzes, allNotes, foundTarget] = await Promise.all([
        Attendance.find({ week, module: mod }).lean(),
        QuizAttempt.find({ week, module: mod }).lean(),
        Activity.countDocuments({
          type: 'notes_generated',
          timestamp: { $gte: getSevenDaysAgo() }
        }),
        AnalyticsTarget.findOne({ student: null, week, module })
      ]);

      attPct = calcAttPct(allAtt);
      quizPct = calcAvg(allQuizzes, 'score');
      notesFreq = allNotes;
      target = foundTarget || new AnalyticsTarget({
        student: null,
        week,
        module,
        attendanceTarget: 75,
        quizTarget: 75,
        isLocked: true
      });
    } else {
      // Student view: calculate only that student's weekly stats
      const mod = moduleFilter(module);

      const [foundTarget, curWeekAtt, curWeekQuizzes, noteCount] = await Promise.all([
        AnalyticsTarget.findOne({ student: studentId, week, module }),
        Attendance.find({ student: studentId, week, module: mod }).lean(),
        QuizAttempt.find({ student: studentId, week, module: mod }).lean(),
        Activity.countDocuments({
          user: studentId,
          type: 'notes_generated',
          timestamp: { $gte: getSevenDaysAgo() }
        })
      ]);

      attPct = calcAttPct(curWeekAtt);
      quizPct = calcAvg(curWeekQuizzes, 'score');
      notesFreq = noteCount;

      target = foundTarget || new AnalyticsTarget({
        student: studentId,
        week,
        module: module || 'Overall',
        attendanceTarget: 75,
        quizTarget: 75,
        isLocked: false
      });
    }

    aiInsightRaw = await geminiService.generateContent('analytics', {
      attendance: attPct,
      quizScore: quizPct,
      notesFrequency: notesFreq,
      role: role || 'student',
      module,
      weakTopics: 'Analyzed module data'
    });

    // Preserve original output contract here
    const criticalInsight = {
      weeklyAnalysis: aiInsightRaw.weeklyAnalysis,
      type:
        aiInsightRaw.riskLevel === 'High'
          ? 'WARNING'
          : aiInsightRaw.riskLevel === 'Medium'
          ? 'ACTION'
          : 'SPARK',
      priority: aiInsightRaw.riskLevel === 'High' ? 'high' : 'medium',
      isSimulated: aiInsightRaw.isSimulated || false
    };

    target.aiInsight = criticalInsight;
    await target.save();

    res.json(criticalInsight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getAnalyticsHistory

// Return a 5-week history of target vs actual performance
exports.getAnalyticsHistory = async (req, res) => {
  const { studentId } = req.params;
  const { module = 'Overall' } = req.query;

  if (!isValidId(studentId)) {
    return res.status(400).json({ message: `Invalid Student ID format: ${studentId}` });
  }

  try {
    // Read all needed data once, then group in memory by week
    const [allTargets, allAttendance, allQuizzes] = await Promise.all([
      AnalyticsTarget.find(withModule({ student: studentId }, module)).lean(),
      Attendance.find(withModule({ student: studentId }, module)).lean(),
      QuizAttempt.find(withModule({ student: studentId }, module)).lean()
    ]);

    const targetsByWeek = new Map(allTargets.map(t => [t.week, t]));
    const attByWeek = new Map();
    const quizByWeek = new Map();

    for (const row of allAttendance) {
      if (!attByWeek.has(row.week)) attByWeek.set(row.week, []);
      attByWeek.get(row.week).push(row);
    }

    for (const row of allQuizzes) {
      if (!quizByWeek.has(row.week)) quizByWeek.set(row.week, []);
      quizByWeek.get(row.week).push(row);
    }

    const history = [];

    for (let week = 1; week <= 5; week++) {
      const target = targetsByWeek.get(week) || {
        attendanceTarget: 0,
        quizTarget: 0,
        unlockCount: 0
      };

      const weekAtt = attByWeek.get(week) || [];
      const weekQuizzes = quizByWeek.get(week) || [];

      const attPct = calcAttPct(weekAtt);
      const quizPct = calcAvg(weekQuizzes, 'score');

      // If an AI insight already exists, reuse it
      let aiInsight = target.aiInsight;

      // Otherwise generate a simple rule-based insight
      if (!aiInsight) {
        aiInsight = {
          text: 'Keep up the consistent effort! Your progress is steady.',
          type: 'SPARK',
          priority: 'low'
        };

        if (attPct < target.attendanceTarget) {
          aiInsight = {
            text: `Attendance alert for Week ${week}: You missed your target by ${(target.attendanceTarget - attPct).toFixed(2)}%. Deploy AI Analytics to uncover underlying module-specific patterns.`,
            type: 'WARNING',
            priority: 'high'
          };
        } else if (quizPct < target.quizTarget) {
          aiInsight = {
            text: `Quiz performance alert: Your average is ${(target.quizTarget - quizPct).toFixed(2)}% below your commitment. Click 'Deploy AI Trace Analysis' to identify specific logic bottlenecks.`,
            type: 'ACTION',
            priority: 'medium'
          };
        } else if (attPct >= target.attendanceTarget && quizPct >= target.quizTarget) {
          aiInsight = {
            text: `Great work in Week ${week}! Both targets met. Deploy AI Intelligence to see your mastery clusters and potential acceleration steps.`,
            type: 'SPARK',
            priority: 'medium'
          };
        }
      }

      history.push({
        week,
        attendance: { actual: attPct, target: target.attendanceTarget },
        quiz: { actual: quizPct, target: target.quizTarget },
        aiInsight
      });
    }

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getAdminStats

// Return high-level statistics for admin dashboard
exports.getAdminStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // All admin stats are independent, so fetch them in parallel
    const [
      totalStudents,
      activeStudents,
      totalLecturers,
      activeLecturers,
      studentBreakdown,
      lecturerBreakdown
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({
        role: 'student',
        $or: [{ lastLogin: { $gte: thirtyDaysAgo } }, { updatedAt: { $gte: thirtyDaysAgo } }]
      }),
      User.countDocuments({ role: 'Lecturer' }),
      User.countDocuments({
        role: 'Lecturer',
        $or: [{ lastLogin: { $gte: thirtyDaysAgo } }, { updatedAt: { $gte: thirtyDaysAgo } }]
      }),
      User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: { year: '$academicYear', sem: '$semester' },
            count: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $gte: ['$lastLogin', thirtyDaysAgo] }, 1, 0]
              }
            }
          }
        }
      ]),
      User.aggregate([
        { $match: { role: 'Lecturer' } },
        { $unwind: '$assignedModules' },
        { $group: { _id: '$assignedModules', count: { $sum: 1 } } }
      ])
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

// getWeeklyLearningReport

// Return a rolling 7-day report for either a lecturer or a student
exports.getWeeklyLearningReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = getSevenDaysAgo();

    const user = await User.findById(userId).lean();
    const assignedModules = user?.assignedModules || [];

    if (req.user.role === 'Lecturer') {
      // Lecturer: summarize all assigned modules
      const [attendance, quizzes, notesCount] = await Promise.all([
        Attendance.find({
          module: { $in: assignedModules },
          date: { $gte: sevenDaysAgo }
        }).lean(),
        QuizAttempt.find({
          module: { $in: assignedModules },
          date: { $gte: sevenDaysAgo }
        }).lean(),
        Activity.countDocuments({
          module: { $in: assignedModules },
          type: 'notes_generated',
          timestamp: { $gte: sevenDaysAgo }
        })
      ]);

      return res.json({
        attendance: { overall: calcAttPct(attendance) },
        notes: {
          frequency: notesCount,
          status: notesCount > 20 ? 'High' : 'Normal'
        },
        quiz: {
          averageScore: calcAvg(quizzes, 'score'),
          totalAttempts: quizzes.length
        }
      });
    }

    // Student: summarize only their own recent records
    const [attendance, quizzes, notesFrequency] = await Promise.all([
      Attendance.find({ student: userId, date: { $gte: sevenDaysAgo } }).lean(),
      QuizAttempt.find({ student: userId, date: { $gte: sevenDaysAgo } }).lean(),
      Activity.countDocuments({
        user: userId,
        type: 'notes_generated',
        timestamp: { $gte: sevenDaysAgo }
      })
    ]);

    const moduleAttendance = assignedModules.map(mod => ({
      module: mod,
      percentage: calcAttPct(attendance.filter(a => a.module === mod))
    }));

    res.json({
      attendance: {
        overall: calcAttPct(attendance),
        byModule: moduleAttendance
      },
      notes: {
        frequency: notesFrequency,
        status: notesFrequency >= 3 ? 'High' : notesFrequency >= 1 ? 'Moderate' : 'Low'
      },
      quiz: {
        averageScore: calcAvg(quizzes, 'score'),
        totalAttempts: quizzes.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getQuizDeepDive


// Perform detailed quiz failure analysis for one module
exports.getQuizDeepDive = async (req, res) => {
  const { module } = req.params;
  const week = req.query.week ? Number(req.query.week) : null;

  try {
    const filter = { module };
    if (req.user.role === 'student') filter.student = req.user._id;
    if (week) filter.week = week;

    const notesFilter = { module, type: 'notes_generated' };
    const attFilter = { module, status: 'Present' };

    if (week) {
      // Build a week-based date window for note activity
      const base = new Date('2026-03-01');
      const start = new Date(base);
      const end = new Date(base);
      start.setDate(start.getDate() + (week - 1) * 7);
      end.setDate(end.getDate() + week * 7);

      notesFilter.timestamp = { $gte: start, $lte: end };
      attFilter.week = week;
    } else {
      const sevenDaysAgo = getSevenDaysAgo();
      notesFilter.timestamp = { $gte: sevenDaysAgo };
      attFilter.date = { $gte: sevenDaysAgo };
    }

    // Fetch everything together to reduce wait time
    const [attempts, classNotes, moduleAtt, moduleNotes, quizStats] = await Promise.all([
      QuizAttempt.find(filter).populate('quiz', 'concept title').lean(),
      Activity.countDocuments(notesFilter),
      Attendance.find(attFilter).lean(),
      Activity.find(notesFilter).lean(),
      QuizAttempt.aggregate([
        { $match: filter },
        { $lookup: { from: 'quizzes', localField: 'quiz', foreignField: '_id', as: 'quizData' } },
        { $unwind: '$quizData' },
        {
          $group: {
            _id: '$quizData.title',
            avgScore: { $sum: '$score' },
            count: { $sum: 1 },
            week: { $first: '$quizData.week' }
          }
        }
      ])
    ]);

    const totalEnrolled = 25;
    const uniquePresentStudents = new Set(moduleAtt.map(a => String(a.student))).size;
    const avgClassAttendance = (uniquePresentStudents / totalEnrolled) * 100;
    const avgScore = calcAvg(attempts, 'score');

    if (!attempts.length) {
      return res.json({
        message: 'No data for this week/module',
        insights: [],
        classStats: {
          notesFrequency: classNotes,
          attendance: avgClassAttendance,
          totalEnrolled,
          activeNoteTakers: Math.floor(classNotes / 3)
        },
        averageScore: 0
      });
    }

    // These three objects collect all analytics in one pass
    const topicImpactMap = {};
    const topicFailureRaw = {};
    const questionFailMap = {};

    for (const attempt of attempts) {
      const difficultyWeight = attempt.score > 80 ? 1 : attempt.score > 50 ? 2 : 3;
      const quizTitle = attempt.quiz?.title || 'Unknown Quiz';
      const quizDate = attempt.createdAt || attempt.date || null;
      const studentKey = String(attempt.student);

      for (const resItem of attempt.questionResults || []) {
        const topic = getGranularTopic(resItem.questionText, attempt.module) || attempt.quiz?.concept;
        const questionKey = resItem.questionText;

        if (topic) {
          if (!topicImpactMap[topic]) {
            topicImpactMap[topic] = { weightedFails: 0, totalSeen: 0, actualFails: 0 };
          }

          topicImpactMap[topic].totalSeen += 1;

          if (!resItem.isCorrect) {
            topicImpactMap[topic].weightedFails += difficultyWeight;
            topicImpactMap[topic].actualFails += 1;
          }

          if (!topicFailureRaw[topic]) {
            topicFailureRaw[topic] = { total: 0, failed: 0, students: new Set() };
          }

          topicFailureRaw[topic].total += 1;

          if (!resItem.isCorrect) {
            topicFailureRaw[topic].failed += 1;
            topicFailureRaw[topic].students.add(studentKey);
          }
        }

        if (!questionFailMap[questionKey]) {
          questionFailMap[questionKey] = { total: 0, failed: 0, quizTitle, quizDate };
        }

        questionFailMap[questionKey].total += 1;
        if (!resItem.isCorrect) questionFailMap[questionKey].failed += 1;
      }
    }

    const missions = Object.keys(topicImpactMap)
      .map(topic => {
        const item = topicImpactMap[topic];
        const rawScore = (item.weightedFails / (item.totalSeen * 3)) * 100;

        return {
          topic,
          blockerScore: Math.min(rawScore, 100),
          actualFailureRate: (item.actualFails / item.totalSeen) * 100,
          status: item.weightedFails > 2 ? 'Foundation Blocker' : 'Minor Gap',
          intel: {
            patternInsights: [
              `High failure rate detected on ${topic} questions`,
              'Pattern: surface-level engagement without deep conceptual processing',
              "Bloom's gap: stored knowledge is not being applied under exam conditions"
            ],
            dependencyChain: ['Foundation Concepts', 'Core Principles', 'Applied Logic', 'Problem Solving'],
            pinpointQuestion: `At which node in the ${topic} dependency chain do you lose confidence?`,
            fix: `Rebuild the core logic of ${topic} from memory only. Map cause-effect relationships — not definitions.`,
            validate: 'Re-attempt quiz questions on this topic. Target >=70% to clear the blocker.'
          }
        };
      })
      .filter(item => item.actualFailureRate > 0 && item.topic !== 'Core Concepts')
      .sort((a, b) => b.blockerScore - a.blockerScore)
      .slice(0, 3);

    const accelerators = Object.keys(topicImpactMap)
      .map(topic => ({
        topic,
        masteryScore: 100 - ((topicImpactMap[topic].actualFails / topicImpactMap[topic].totalSeen) * 100)
      }))
      .filter(item => item.masteryScore > 85)
      .sort((a, b) => b.masteryScore - a.masteryScore)
      .slice(0, 2);

    const topicFailureSummary = Object.entries(topicFailureRaw)
      .map(([topic, value]) => ({
        topic,
        failureRate: value.total ? (value.failed / value.total) * 100 : 0,
        studentsAffected: value.students.size,
        severity:
          (value.failed / value.total) > 0.6
            ? 'Critical'
            : (value.failed / value.total) > 0.4
            ? 'Warning'
            : 'Monitor'
      }))
      .filter(item => item.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate);

    const hardestQuestions = Object.entries(questionFailMap)
      .map(([text, value]) => ({
        text,
        failureRate: value.total ? (value.failed / value.total) * 100 : 0,
        quizTitle: value.quizTitle,
        quizDate: value.quizDate
      }))
      .filter(item => item.failureRate > 0)
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 3);

    const formattedQuizStats = quizStats
      .map(item => ({
        title: item._id,
        avgScore: item.avgScore / item.count,
        week: item.week
      }))
      .sort((a, b) => b.week - a.week);

    const uniqueNoteTakers = new Set(moduleNotes.map(n => String(n.user))).size;

    res.json({
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
      },
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
