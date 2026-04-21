const express = require('express');
const router = express.Router();
const { 
  addAttendance, 
  createSession, 
  getActiveSessions, 
  endSession, 
  markAttendance, 
  updateAttendanceStatus, 
  getEnrollmentCount, 
  getModuleAttendance, 
  getStudentAttendance 
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addAttendance);
router.post('/session', protect, createSession);
router.get('/sessions/active', protect, getActiveSessions);
router.put('/session/:id/end', protect, endSession);
router.post('/mark', protect, markAttendance);
router.put('/override', protect, updateAttendanceStatus);
router.get('/enrollment-count', protect, getEnrollmentCount);
router.get('/module/:moduleName', protect, getModuleAttendance);
router.get('/:studentId', protect, getStudentAttendance);

module.exports = router;
