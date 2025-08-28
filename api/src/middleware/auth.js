const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      error: 'Token verification failed',
      message: 'An error occurred while verifying your token.',
      code: 'VERIFICATION_FAILED'
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user';
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles,
        userRole
      });
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or has admin role
 * @param {string} resourceUserIdField - Field name containing resource user ID
 * @returns {Function} Express middleware function
 */
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role || 'user';
    const userId = req.user.id;
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField] || req.query[resourceUserIdField];

    // Admin can access any resource
    if (userRole === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (userId === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources.',
      code: 'ACCESS_DENIED'
    });
  };
};

/**
 * Validation middleware for common fields
 */
const validateCommonFields = {
  // User validation
  validateUser: [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('displayName').trim().isLength({ min: 2, max: 50 }).withMessage('Display name must be between 2 and 50 characters')
  ],

  // Inventory item validation
  validateInventoryItem: [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Item name is required and must be less than 100 characters'),
    body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required and must be less than 50 characters'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number')
  ],

  // Spending transaction validation
  validateSpendingTransaction: [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').trim().isLength({ min: 1, max: 50 }).withMessage('Category is required and must be less than 50 characters'),
    body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description is required and must be less than 200 characters'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date')
  ]
};

/**
 * Middleware to handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again.',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Middleware to check if user is online (for real-time features)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkOnlineStatus = (req, res, next) => {
  // This middleware can be used to check if a user is currently online
  // Implementation depends on your online status tracking system
  req.userOnline = true; // Placeholder - implement actual online status checking
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnershipOrAdmin,
  validateCommonFields,
  handleValidationErrors,
  checkOnlineStatus
};
