/**
 * Send standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} pagination - Pagination info (optional)
 */
const sendSuccess = (res, statusCode, message, data = null, pagination = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Error details (optional)
 */
const sendError = (res, statusCode, code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Calculate pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items count
 * @returns {Object} Pagination object
 */
const getPagination = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / itemsPerPage);

  return {
    page: currentPage,
    limit: itemsPerPage,
    total,
    pages: totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

/**
 * Calculate skip value for pagination
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {number} Skip value
 */
const getSkip = (page, limit) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  return (currentPage - 1) * itemsPerPage;
};

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Calculate date difference in days
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} Difference in days
 */
const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Calculate fine amount
 * @param {Date} dueDate - Due date
 * @param {Date} returnDate - Return date (defaults to current date)
 * @returns {number} Fine amount
 */
const calculateFine = (dueDate, returnDate = new Date()) => {
  const finePerDay = parseInt(process.env.FINE_PER_DAY) || 5;
  const overdueDays = getDaysDifference(returnDate, dueDate);

  if (returnDate <= dueDate) {
    return 0;
  }

  return overdueDays * finePerDay;
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Check if date is in past
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is in past
 */
const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Add days to date
 * @param {Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Build search query for MongoDB
 * @param {string} searchTerm - Search term
 * @param {Array} fields - Fields to search in
 * @returns {Object} MongoDB query object
 */
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};

  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  sendSuccess,
  sendError,
  getPagination,
  getSkip,
  generateRandomString,
  getDaysDifference,
  calculateFine,
  formatFileSize,
  sanitizeFilename,
  isDateInPast,
  addDays,
  buildSearchQuery,
  asyncHandler,
};
