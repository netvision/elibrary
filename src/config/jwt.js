const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to encode in token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
};
