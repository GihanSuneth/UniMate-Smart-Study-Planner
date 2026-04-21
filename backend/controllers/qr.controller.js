const qrService = require('../services/qr.service');
const AttendanceSession = require('../models/AttendanceSession');

exports.generateQR = async (req, res) => {
  const { module, week, duration, baseUrl } = req.body;
  const lecturerId = req.user._id;

  try {
    if (week < 5) {
      throw new Error("Attendance sessions cannot be created for past academic weeks.");
    }
    const result = await qrService.generateQR(lecturerId, module, week, duration || 10, baseUrl);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { sessionToken } = req.body;
  const studentId = req.user._id;
  
  try {
    const record = await qrService.markAttendance(studentId, sessionToken);
    res.status(200).json({ message: "Attendance marked successfully", record });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.extendSession = async (req, res) => {
  const { sessionToken, additionalMinutes } = req.body;
  
  try {
    const session = await qrService.extendSession(sessionToken, additionalMinutes);
    res.status(200).json({ message: "Session extended", expiresAt: session.expiresAt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.endSession = async (req, res) => {
  const { sessionToken } = req.body;
  
  try {
    const session = await AttendanceSession.findOne({ uniqueCode: sessionToken });
    if (session) {
      session.isActive = false;
      await session.save();
    }
    res.status(200).json({ message: "Session ended successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getQRImage = async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    // Regenerate QR on the fly to ensure security (don't store large blobs in DB)
    const QRCode = require('qrcode');
    const baseUrl = req.query.baseUrl || '';
    const qrDataStr = baseUrl ? `${baseUrl}/mark-attendance?code=${session.uniqueCode}` : session.uniqueCode;
    const qrBase64 = await QRCode.toDataURL(qrDataStr);
    
    res.status(200).json({ qrImage: qrBase64 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
