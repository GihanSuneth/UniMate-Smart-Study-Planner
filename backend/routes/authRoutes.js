const express = require('express');
const router = express.Router();
const { registerUser, loginUser, approveUser, rejectUser, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin routes (Protected by middleware)
router.get('/users', protect, admin, getUsers);
router.put('/approve/:id', protect, admin, approveUser);
router.put('/reject/:id', protect, admin, rejectUser);

module.exports = router;
