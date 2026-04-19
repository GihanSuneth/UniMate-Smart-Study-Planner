const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const User = require('../models/User');

// @desc    Add attendance record
// @route   POST /api/attendance
// @access  Private
exports.addAttendance = async (req, res) => {
  const { student, module, date, week, status } = req.body;

  try {
    const attendance = await Attendance.create({
      student,
      module,
      date,
      week,
      status,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/:studentId
// @access  Private
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // 1. Get student to find assigned modules (dynamic denominator)
    const student = await User.findById(studentId);
    const assignedModules = student?.assignedModules?.length > 0 
      ? student.assignedModules 
      : ['Programming Applications', 'Database Systems', 'Operating Systems', 'Software Engineering'];

    // 2. Optimized DB Lookup
    const attendance = await Attendance.find({ student: studentId });
    
    // Calculate overall stats
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'Present').length;
    const overallPercentage = total > 0 ? (present / total) * 100 : 0;

    // Calculate weekly stats for the last 5 weeks
    const weeklyStats = [];
    for (let i = 1; i <= 5; i++) {
      const weekAtt = attendance.filter(a => a.week === i);
      const weekPresent = weekAtt.filter(a => a.status === 'Present').length;
      
      // Use dynamic denominator based on assigned modules for this student
      const percentage = assignedModules.length > 0 ? (weekPresent / assignedModules.length) * 100 : 0;
      weeklyStats.push({ week: i, present: weekPresent, percentage });
    }

    // Calculate module-wise stats (using assigned modules)
    const moduleStats = assignedModules.map(mod => {
      const modAtt = attendance.filter(a => a.module === mod);
      const modTotal = modAtt.length;
      const modPresent = modAtt.filter(a => a.status === 'Present').length;
      const percentage = modTotal > 0 ? (modPresent / modTotal) * 100 : 0;
      return { module: mod, percentage, total: modTotal, present: modPresent };
    });

    res.json({
      overallPercentage,
      weeklyStats,
      moduleStats,
      records: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new attendance session (QR Code)
// @route   POST /api/attendance/session
// @access  Private (Lecturer)
exports.createSession = async (req, res) => {
  const { lecturer, module, week } = req.body;
  // Generate random 6 character code
  const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  try {
    const session = await AttendanceSession.create({
      lecturer,
      module,
      week,
      uniqueCode,
      isActive: true,
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student marks attendance via code
// @route   POST /api/attendance/mark
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
  const { studentId, code } = req.body;

  try {
    const session = await AttendanceSession.findOne({ uniqueCode: code.toUpperCase(), isActive: true });
    
    if (!session) {
      return res.status(404).json({ message: 'Invalid or expired attendance code' });
    }

    // Check if already marked
    const existing = await Attendance.findOne({
      student: studentId,
      module: session.module,
      week: session.week
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already marked attendance for this module this week' });
    }

    const attendance = await Attendance.create({
      student: studentId,
      module: session.module,
      date: new Date(),
      week: session.week,
      status: 'Present',
    });

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed attendance by module (Lecturer View)
// @route   GET /api/attendance/module/:moduleName
// @access  Private (Lecturer)
exports.getModuleAttendance = async (req, res) => {
  const { moduleName } = req.params;

  try {
    // Note: To get student details, we populate the student reference including portalId
    const records = await Attendance.find({ module: moduleName }).populate('student', 'username email portalId');
    
    // Group logic to figure out total unique students and proportion can be done here or on frontend.
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End an attendance session
// @route   PUT /api/attendance/session/:id/end
// @access  Private (Lecturer)
exports.endSession = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    session.isActive = false;
    await session.save();
    
    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active attendance sessions
// @route   GET /api/attendance/sessions/active
// @access  Private (Student)
exports.getActiveSessions = async (req, res) => {
  try {
    const activeSessions = await AttendanceSession.find({ isActive: true }).populate('lecturer', 'username email');
    res.json(activeSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get total enrollment count for a module/semester
// @route   GET /api/attendance/enrollment-count
// @access  Private (Lecturer)
exports.getEnrollmentCount = async (req, res) => {
  const { module, year, semester } = req.query;
  try {
    const filter = { role: 'student' };
    if (module) filter.assignedModules = module;
    if (year) filter.academicYear = year;
    if (semester) filter.semester = semester;

    const count = await User.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Manually override attendance status
// @route   PUT /api/attendance/override
// @access  Private (Lecturer)
exports.updateAttendanceStatus = async (req, res) => {
  const { studentId, module, week, status } = req.body;
  try {
    let attendance = await Attendance.findOne({ student: studentId, module, week });
    
    if (attendance) {
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        module,
        week,
        status,
        date: new Date()
      });
    }

    res.json({ message: `Attendance updated to ${status}`, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
