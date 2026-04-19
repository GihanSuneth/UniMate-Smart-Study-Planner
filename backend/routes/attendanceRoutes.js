const express = require('express');
const router = express.Router();
const { addAttendance, getStudentAttendance, createSession, markAttendance, getModuleAttendance, endSession, getActiveSessions, getEnrollmentCount } = require('../controllers/attendanceController');

router.post('/', addAttendance);
router.post('/session', createSession);
router.get('/sessions/active', getActiveSessions);
router.put('/session/:id/end', endSession);
router.post('/mark', markAttendance);
router.get('/enrollment-count', getEnrollmentCount);
router.get('/module/:moduleName', getModuleAttendance);
router.get('/:studentId', getStudentAttendance);

module.exports = router;
