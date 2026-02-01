const Joi = require('joi');

/**
 * User registration validation schema
 */
const registerSchema = Joi.object({
  admissionNumber: Joi.string().required().messages({
    'string.empty': 'Admission number is required',
  }),
  name: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    }),
  role: Joi.string().valid('student', 'teacher', 'librarian', 'admin').default('student'),
  class: Joi.number().integer().min(1).max(12).when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  section: Joi.string().max(10).optional(),
  board: Joi.string().default('RBSE'),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.string().max(500).optional(),
});

/**
 * User login validation schema
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Book creation validation schema
 */
const bookSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  author: Joi.string().max(200).required(),
  isbn: Joi.string().optional(),
  publisher: Joi.string().max(200).optional(),
  publicationYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  category: Joi.string()
    .valid('textbook', 'reference', 'fiction', 'non-fiction', 'biography', 'other')
    .required(),
  subject: Joi.string().max(100).optional(),
  class: Joi.number().integer().min(1).max(12).optional(),
  language: Joi.string().valid('Hindi', 'English', 'Sanskrit', 'Other').required(),
  totalCopies: Joi.number().integer().min(1).required(),
  location: Joi.string().max(100).optional(),
  description: Joi.string().max(2000).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isRBSE: Joi.boolean().default(false),
  isNCERT: Joi.boolean().default(false),
});

/**
 * Digital resource validation schema
 */
const digitalResourceSchema = Joi.object({
  title: Joi.string().min(1).max(500).required(),
  type: Joi.string().valid('ebook', 'pdf', 'video', 'audio').required(),
  author: Joi.string().max(200).optional(),
  subject: Joi.string().max(100).optional(),
  class: Joi.number().integer().min(1).max(12).optional(),
  board: Joi.string().valid('RBSE', 'NCERT', 'CBSE', 'Other').optional(),
  language: Joi.string().valid('Hindi', 'English', 'Sanskrit', 'Other').required(),
  description: Joi.string().max(2000).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

/**
 * Borrowing validation schema
 */
const borrowingSchema = Joi.object({
  bookId: Joi.string().required().messages({
    'string.empty': 'Book ID is required',
  }),
});

/**
 * Bookmark validation schema
 */
const bookmarkSchema = Joi.object({
  resourceId: Joi.string().required(),
  resourceType: Joi.string().valid('book', 'digital').required(),
  notes: Joi.string().max(500).optional(),
});

/**
 * Update user validation schema
 */
const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .optional(),
  address: Joi.string().max(500).optional(),
  section: Joi.string().max(10).optional(),
});

/**
 * Password reset validation schema
 */
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords must match',
  }),
});

/**
 * Admin update user validation schema
 */
const adminUpdateUserSchema = Joi.object({
  admissionNumber: Joi.string().optional(),
  name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('student', 'teacher', 'librarian', 'admin').optional(),
  class: Joi.number().integer().min(1).max(12).optional(),
  section: Joi.string().max(10).optional(),
  board: Joi.string().optional(),
  phone: Joi.string()
    .pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .optional(),
  dateOfBirth: Joi.date().max('now').optional(),
  address: Joi.string().max(500).optional(),
});

/**
 * Validate request data against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors,
        },
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  bookSchema,
  digitalResourceSchema,
  borrowingSchema,
  bookmarkSchema,
  updateUserSchema,
  resetPasswordSchema,
  adminUpdateUserSchema,
};
