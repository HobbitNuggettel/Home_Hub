/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('🚨 API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    errorCode = 'INTERNAL_ERROR';
  }

  // Send error response
  res.status(statusCode).json({
    error: true,
    message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
};

/**
 * Async error wrapper to catch async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware for 404 errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/api/auth',
      '/api/users',
      '/api/inventory',
      '/api/spending',
      '/api/analytics',
      '/api-docs',
      '/health'
    ]
  });
};

/**
 * Rate limit exceeded handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rateLimitExceeded = (req, res) => {
  res.status(429).json({
    error: true,
    message: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    retryAfter: Math.ceil(15 * 60), // 15 minutes in seconds
    message: 'Too many requests from this IP, please try again later.'
  });
};

/**
 * Validation error formatter
 * @param {Array} errors - Validation errors array
 * @returns {Object} Formatted error object
 */
const formatValidationErrors = (errors) => {
  return {
    error: true,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    timestamp: new Date().toISOString(),
    details: errors.map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value,
      location: error.location
    }))
  };
};

/**
 * Database error handler
 * @param {Error} err - Database error
 * @returns {Object} Formatted error object
 */
const handleDatabaseError = (err) => {
  let statusCode = 500;
  let message = 'Database operation failed';
  let errorCode = 'DATABASE_ERROR';

  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Resource already exists';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  return {
    statusCode,
    error: true,
    message,
    code: errorCode,
    timestamp: new Date().toISOString()
  };
};

/**
 * File upload error handler
 * @param {Error} err - File upload error
 * @returns {Object} Formatted error object
 */
const handleFileUploadError = (err) => {
  let statusCode = 400;
  let message = 'File upload failed';
  let errorCode = 'FILE_UPLOAD_ERROR';

  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size too large';
    errorCode = 'FILE_TOO_LARGE';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    message = 'Too many files';
    errorCode = 'TOO_MANY_FILES';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    message = 'Unexpected file field';
    errorCode = 'UNEXPECTED_FILE';
  }

  return {
    statusCode,
    error: true,
    message,
    code: errorCode,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  rateLimitExceeded,
  formatValidationErrors,
  handleDatabaseError,
  handleFileUploadError
};
