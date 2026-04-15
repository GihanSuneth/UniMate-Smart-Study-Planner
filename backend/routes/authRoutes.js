const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  registerUser, loginUser, approveUser, rejectUser, getUsers, 
  getUserProfile, updateUserProfile, updatePassword, 
  bulkUpdateUsers, deleteUser, adminUpdateUser, verifyPassword, resetUserPassword,
  lookupPortalId
} = authController;
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/portal-id-lookup', lookupPortalId);

// Private routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, updatePassword);
router.post('/verify-password', protect, verifyPassword);

// Admin routes (Protected by middleware)
router.get('/users', protect, admin, getUsers);
router.put('/approve/:id', protect, admin, approveUser);
router.put('/reject/:id', protect, admin, rejectUser);
router.post('/bulk-update', protect, admin, bulkUpdateUsers);
router.delete('/:id', protect, admin, deleteUser);
router.put('/admin/update/:id', protect, admin, adminUpdateUser);
router.put('/admin/reset-password/:id', protect, admin, resetUserPassword);

module.exports = router;
