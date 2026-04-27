const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, qrController.generateQR);
router.get('/session/:id/image', protect, qrController.getQRImage);
router.post('/mark-attendance', protect, qrController.markAttendance);
router.put('/extend', protect, qrController.extendSession);
router.put('/end', protect, qrController.endSession);


module.exports = router;
