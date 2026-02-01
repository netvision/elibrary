const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  getAllUsers,
  activateUser,
  deactivateUser,
  createUser,
  updateUser,
  changeUserPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { validate, registerSchema, loginSchema, resetPasswordSchema, adminUpdateUserSchema } = require('../utils/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.post('/logout', protect, logout);

// Admin routes
router.get('/users', protect, authorize('admin', 'librarian'), getAllUsers);
router.post('/users', protect, authorize('admin'), validate(registerSchema), createUser);
router.put('/users/:userId', protect, authorize('admin'), validate(adminUpdateUserSchema), updateUser);
router.put('/users/:userId/password', protect, authorize('admin'), validate(resetPasswordSchema), changeUserPassword);
router.put('/users/:userId/activate', protect, authorize('admin'), activateUser);
router.put('/users/:userId/deactivate', protect, authorize('admin'), deactivateUser);

module.exports = router;
