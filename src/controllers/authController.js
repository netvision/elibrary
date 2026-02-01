const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { admissionNumber, name, email, password, role, class: userClass, section, board, phone, dateOfBirth, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ email }, { admissionNumber }] });

  if (existingUser) {
    if (existingUser.email === email) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Email already registered');
    }
    if (existingUser.admissionNumber === admissionNumber) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Admission number already registered');
    }
  }

  // Create user
  const user = await User.create({
    admissionNumber,
    name,
    email,
    password,
    role: role || 'student',
    class: userClass,
    section,
    board: board || 'RBSE',
    phone,
    dateOfBirth,
    address,
  });

  // Generate token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    admissionNumber: user.admissionNumber,
    class: user.class,
    board: user.board,
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch((error) => {
    logger.error(`Failed to send welcome email: ${error.message}`);
  });

  logger.info(`New user registered: ${user.email}`);

  return sendSuccess(res, 201, 'User registered successfully', {
    token,
    user,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendError(res, 401, 'AUTHENTICATION_ERROR', 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 401, 'AUTHENTICATION_ERROR', 'Your account has been deactivated');
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return sendError(res, 401, 'AUTHENTICATION_ERROR', 'Invalid email or password');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    admissionNumber: user.admissionNumber,
    class: user.class,
    board: user.board,
  });

  // Remove password from output
  user.password = undefined;

  logger.info(`User logged in: ${user.email}`);

  return sendSuccess(res, 200, 'Login successful', {
    token,
    user,
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  return sendSuccess(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists
    return sendSuccess(res, 200, 'If that email is registered, you will receive a password reset link');
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Send password reset email (non-blocking)
  sendPasswordResetEmail(user, resetToken).catch((error) => {
    logger.error(`Failed to send password reset email: ${error.message}`);
  });

  logger.info(`Password reset requested for: ${user.email}`);

  return sendSuccess(res, 200, 'If that email is registered, you will receive a password reset link');
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash token and find user
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    return sendError(res, 400, 'INVALID_TOKEN', 'Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new token
  const authToken = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    admissionNumber: user.admissionNumber,
    class: user.class,
    board: user.board,
  });

  logger.info(`Password reset successful for: ${user.email}`);

  return sendSuccess(res, 200, 'Password reset successful', { token: authToken });
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isPasswordCorrect) {
    return sendError(res, 401, 'AUTHENTICATION_ERROR', 'Current password is incorrect');
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
    admissionNumber: user.admissionNumber,
    class: user.class,
    board: user.board,
  });

  logger.info(`Password updated for: ${user.email}`);

  return sendSuccess(res, 200, 'Password updated successfully', { token });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // We just log the action here

  logger.info(`User logged out: ${req.user.email}`);

  return sendSuccess(res, 200, 'Logout successful');
});

/**
 * @desc    Create a new user (Admin)
 * @route   POST /api/auth/users
 * @access  Private (Admin only)
 */
const createUser = asyncHandler(async (req, res) => {
  const { admissionNumber, name, email, password, role, class: userClass, section, board, phone, dateOfBirth, address } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { admissionNumber }] });
  if (existingUser) {
    if (existingUser.email === email) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Email already registered');
    }
    if (existingUser.admissionNumber === admissionNumber) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Admission number already registered');
    }
  }

  const user = await User.create({
    admissionNumber,
    name,
    email,
    password,
    role: role || 'student',
    class: userClass,
    section,
    board: board || 'RBSE',
    phone,
    dateOfBirth,
    address,
  });

  logger.info(`Admin created user: ${user.email} by ${req.user.email}`);

  return sendSuccess(res, 201, 'User created successfully', { user });
});

/**
 * @desc    Update user details (Admin)
 * @route   PUT /api/auth/users/:userId
 * @access  Private (Admin only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found');
  }

  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.findOne({ email: updates.email });
    if (emailExists) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Email already registered');
    }
  }

  if (updates.admissionNumber && updates.admissionNumber !== user.admissionNumber) {
    const admissionExists = await User.findOne({ admissionNumber: updates.admissionNumber });
    if (admissionExists) {
      return sendError(res, 400, 'DUPLICATE_ERROR', 'Admission number already registered');
    }
  }

  const allowedFields = [
    'admissionNumber',
    'name',
    'email',
    'role',
    'class',
    'section',
    'board',
    'phone',
    'address',
    'dateOfBirth',
  ];

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      user[field] = updates[field];
    }
  });

  await user.save();

  logger.info(`Admin updated user: ${user.email} by ${req.user.email}`);

  return sendSuccess(res, 200, 'User updated successfully', { user });
});

/**
 * @desc    Change user password (Admin)
 * @route   PUT /api/auth/users/:userId/password
 * @access  Private (Admin only)
 */
const changeUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found');
  }

  user.password = password;
  await user.save();

  logger.info(`Admin changed password for: ${user.email} by ${req.user.email}`);

  return sendSuccess(res, 200, 'Password updated successfully');
});

/**
 * @desc    Get all users (with pagination and filters)
 * @route   GET /api/auth/users
 * @access  Private (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, status, search } = req.query;

  // Build query
  let query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.isActive = status === 'active' ? true : false;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { admissionNumber: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Fetch users
  const users = await User.find(query)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  // Get total count
  const total = await User.countDocuments(query);

  logger.info(`Retrieved ${users.length} users`);

  return sendSuccess(res, 200, 'Users retrieved successfully', {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Activate user
 * @route   PUT /api/v1/auth/users/:userId/activate
 * @access  Private (Admin only)
 */
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found');
  }

  user.isActive = true;
  await user.save();

  logger.info(`User activated: ${user.email} by ${req.user.email}`);

  return sendSuccess(res, 200, 'User activated successfully', { user });
});

/**
 * @desc    Deactivate user
 * @route   PUT /api/v1/auth/users/:userId/deactivate
 * @access  Private (Admin only)
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return sendError(res, 404, 'NOT_FOUND', 'User not found');
  }

  // Prevent self-deactivation
  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 400, 'BAD_REQUEST', 'You cannot deactivate yourself');
  }

  user.isActive = false;
  await user.save();

  logger.info(`User deactivated: ${user.email} by ${req.user.email}`);

  return sendSuccess(res, 200, 'User deactivated successfully', { user });
});

module.exports = {
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
};
