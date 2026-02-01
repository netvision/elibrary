const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.email : 'Not authenticated',
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    error.message = message;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error.statusCode = 400;
    error.code = 'DUPLICATE_ERROR';
    error.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.message = message.join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.code = 'AUTHENTICATION_ERROR';
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.code = 'AUTHENTICATION_ERROR';
    error.message = 'Token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 400;
      error.code = 'FILE_TOO_LARGE';
      error.message = 'File size exceeds the maximum allowed limit';
    } else {
      error.statusCode = 400;
      error.code = 'FILE_UPLOAD_ERROR';
      error.message = err.message;
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      code: error.code || 'SERVER_ERROR',
      message: error.message || 'Internal server error',
    },
  });
};

/**
 * Handle 404 errors - Route not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

module.exports = { errorHandler, notFound };
