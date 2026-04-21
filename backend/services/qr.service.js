const QRCode = require('qrcode');
const AttendanceSession = require('../models/AttendanceSession');
const Attendance = require('../models/Attendance');

class QRService {
  async generateQR(lecturerId, module, week, durationMinutes, baseUrl) {
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    const session = await AttendanceSession.create({
      lecturer: lecturerId,
      module,
      week,
      uniqueCode,
      expiresAt,
      isActive: true
    });

    const qrDataStr = baseUrl ? `${baseUrl}/mark-attendance?code=${uniqueCode}` : uniqueCode;
    const qrBase64 = await QRCode.toDataURL(qrDataStr);

    return {
      qrImage: qrBase64,
      sessionToken: uniqueCode,
      expiresAt: session.expiresAt
    };
  }

  async extendSession(sessionToken, additionalMinutes) {
    const session = await AttendanceSession.findOne({ uniqueCode: sessionToken });
    if (!session) throw new Error("Session not found");
    
    session.expiresAt = new Date(session.expiresAt.getTime() + additionalMinutes * 60000);
    session.isActive = true; // Ensure it's active if it was expired
    await session.save();
    return session;
  }

  async markAttendance(studentId, sessionToken) {
    const session = await AttendanceSession.findOne({ uniqueCode: sessionToken });
    
    if (!session) throw new Error("Invalid session code");
    if (!session.isActive || new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      throw new Error("Attendance session has expired");
    }

    // Check if already marked
    const existing = await Attendance.findOne({
      student: studentId,
      module: session.module,
      week: session.week
    });

    if (existing) throw new Error("Attendance already marked for this module this week");

    const record = await Attendance.create({
      student: studentId,
      module: session.module,
      week: session.week,
      date: new Date(),
      status: 'Present'
    });

    return record;
  }
}

module.exports = new QRService();
