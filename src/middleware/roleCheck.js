const { sendError } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Check if user has required role(s)
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        401,
        'AUTHENTICATION_ERROR',
        'Not authenticated'
      );
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by user ${req.user.email} (${req.user.role}) to route requiring ${roles.join(', ')}`
      );

      return sendError(
        res,
        403,
        'AUTHORIZATION_ERROR',
        `User role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

/**
 * Check if user is accessing their own resource or is admin/librarian
 * @param {string} paramName - Name of the parameter containing user ID
 */
const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        401,
        'AUTHENTICATION_ERROR',
        'Not authenticated'
      );
    }

    const resourceUserId = req.params[paramName] || req.body[paramName];

    // Allow if user is admin, librarian, or accessing their own resource
    if (
      req.user.role === 'admin' ||
      req.user.role === 'librarian' ||
      req.user._id.toString() === resourceUserId
    ) {
      return next();
    }

    logger.warn(
      `Unauthorized access attempt by user ${req.user.email} to resource owned by ${resourceUserId}`
    );

    return sendError(
      res,
      403,
      'AUTHORIZATION_ERROR',
      'Not authorized to access this resource'
    );
  };
};

/**
 * Check if user can borrow books (not exceeding limit)
 */
const checkBorrowingLimit = async (req, res, next) => {
  try {
    const Borrowing = require('../models/Borrowing');

    const activeBorrowings = await Borrowing.countDocuments({
      userId: req.user._id,
      status: { $in: ['borrowed', 'overdue'] },
    });

    // Set limit based on role
    let limit = 3; // Default for students
    if (req.user.role === 'teacher') {
      limit = 5;
    } else if (req.user.role === 'librarian' || req.user.role === 'admin') {
      limit = 10;
    }

    if (activeBorrowings >= limit) {
      return sendError(
        res,
        400,
        'BORROWING_LIMIT_EXCEEDED',
        `You have reached the maximum borrowing limit of ${limit} books`
      );
    }

    next();
  } catch (error) {
    logger.error(`Error checking borrowing limit: ${error.message}`);
    return sendError(
      res,
      500,
      'SERVER_ERROR',
      'Error checking borrowing limit'
    );
  }
};

/**
 * Check if user has any overdue books
 */
const checkOverdueBooks = async (req, res, next) => {
  try {
    const Borrowing = require('../models/Borrowing');

    const overdueBooks = await Borrowing.countDocuments({
      userId: req.user._id,
      status: 'overdue',
    });

    if (overdueBooks > 0) {
      return sendError(
        res,
        400,
        'OVERDUE_BOOKS',
        `You have ${overdueBooks} overdue book(s). Please return them before borrowing new books.`
      );
    }

    next();
  } catch (error) {
    logger.error(`Error checking overdue books: ${error.message}`);
    return sendError(
      res,
      500,
      'SERVER_ERROR',
      'Error checking overdue books'
    );
  }
};

module.exports = {
  authorize,
  authorizeOwnerOrAdmin,
  checkBorrowingLimit,
  checkOverdueBooks,
};
