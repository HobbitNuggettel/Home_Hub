/**
 * Validation Middleware for Express
 * Provides request validation, sanitization, and error handling
 */

const validationService = require('../services/ValidationService').default;

/**
 * Validate request body against schema
 * @param {string} schemaName - Schema name
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
const validateBody = (schemaName, options = {}) => {
  return (req, res, next) => {
    try {
      const result = validationService.validate(schemaName, req.body, options);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request body validation failed',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Replace body with validated and sanitized data
      req.body = result.data;
      
      // Add validation info to request
      req.validation = {
        schema: schemaName,
        isValid: true,
        errors: result.errors,
        warnings: result.warnings
      };

      next();
    } catch (error) {
      console.error('Body validation error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'Failed to validate request body',
        details: error.message
      });
    }
  };
};

/**
 * Validate request query parameters against schema
 * @param {string} schemaName - Schema name
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
const validateQuery = (schemaName, options = {}) => {
  return (req, res, next) => {
    try {
      const result = validationService.validate(schemaName, req.query, options);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Query parameters validation failed',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Replace query with validated and sanitized data
      req.query = result.data;
      
      // Add validation info to request
      req.validation = {
        ...req.validation,
        queryValid: true,
        queryErrors: result.errors,
        queryWarnings: result.warnings
      };

      next();
    } catch (error) {
      console.error('Query validation error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'Failed to validate query parameters',
        details: error.message
      });
    }
  };
};

/**
 * Validate request parameters against schema
 * @param {string} schemaName - Schema name
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
const validateParams = (schemaName, options = {}) => {
  return (req, res, next) => {
    try {
      const result = validationService.validate(schemaName, req.params, options);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'URL parameters validation failed',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Replace params with validated and sanitized data
      req.params = result.data;
      
      // Add validation info to request
      req.validation = {
        ...req.validation,
        paramsValid: true,
        paramsErrors: result.errors,
        paramsWarnings: result.warnings
      };

      next();
    } catch (error) {
      console.error('Params validation error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'Failed to validate URL parameters',
        details: error.message
      });
    }
  };
};

/**
 * Validate and sanitize request data
 * @param {string} schemaName - Schema name
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
const validateAndSanitize = (schemaName, options = {}) => {
  return (req, res, next) => {
    try {
      const result = validationService.validateAndSanitize(schemaName, req.body, options);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request data validation failed',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Replace body with validated and sanitized data
      req.body = result.sanitizedData;
      
      // Add validation info to request
      req.validation = {
        schema: schemaName,
        isValid: true,
        errors: result.errors,
        warnings: result.warnings,
        sanitized: true
      };

      next();
    } catch (error) {
      console.error('Validation and sanitization error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'Failed to validate and sanitize request data',
        details: error.message
      });
    }
  };
};

/**
 * Sanitize request data
 * @param {string} type - Sanitization type
 * @returns {function} Express middleware
 */
const sanitizeData = (type = 'general') => {
  return (req, res, next) => {
    try {
      // Sanitize body
      if (req.body) {
        req.body = validationService.sanitize(req.body, type);
      }

      // Sanitize query
      if (req.query) {
        req.query = validationService.sanitize(req.query, type);
      }

      // Sanitize params
      if (req.params) {
        req.params = validationService.sanitize(req.params, type);
      }

      // Add sanitization info to request
      req.sanitization = {
        type,
        sanitized: true
      };

      next();
    } catch (error) {
      console.error('Sanitization error:', error);
      res.status(500).json({
        error: 'Sanitization error',
        message: 'Failed to sanitize request data',
        details: error.message
      });
    }
  };
};

/**
 * Validate file upload
 * @param {object} options - File validation options
 * @returns {function} Express middleware
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    maxFiles = 5
  } = options;

  return (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      
      if (files.length > maxFiles) {
        return res.status(400).json({
          error: 'File upload failed',
          message: `Too many files. Maximum allowed: ${maxFiles}`,
          details: `Received ${files.length} files`
        });
      }

      const errors = [];

      for (const file of files) {
        // Validate file size
        if (file.size > maxSize) {
          errors.push({
            field: file.fieldname || 'file',
            message: `File ${file.originalname} is too large. Maximum size: ${maxSize} bytes`,
            type: 'file_size_error'
          });
        }

        // Validate file type
        if (!allowedTypes.includes(file.mimetype)) {
          errors.push({
            field: file.fieldname || 'file',
            message: `File type ${file.mimetype} is not allowed`,
            type: 'file_type_error'
          });
        }

        // Validate file name
        const fileNameValidation = validationService.validate('fileUpload', {
          name: file.originalname,
          size: file.size,
          type: file.mimetype
        });

        if (!fileNameValidation.isValid) {
          errors.push(...fileNameValidation.errors);
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'File validation failed',
          message: 'One or more files failed validation',
          details: errors
        });
      }

      // Add file validation info to request
      req.fileValidation = {
        isValid: true,
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0)
      };

      next();
    } catch (error) {
      console.error('File validation error:', error);
      res.status(500).json({
        error: 'File validation error',
        message: 'Failed to validate uploaded files',
        details: error.message
      });
    }
  };
};

/**
 * Validate API request
 * @param {object} schema - Request schema
 * @returns {function} Express middleware
 */
const validateApiRequest = (schema) => {
  return (req, res, next) => {
    try {
      const requestData = {
        method: req.method,
        endpoint: req.path,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
      };

      const result = validationService.validate('apiRequest', requestData);
      
      if (!result.isValid) {
        return res.status(400).json({
          error: 'API request validation failed',
          message: 'Request structure is invalid',
          details: result.errors,
          warnings: result.warnings
        });
      }

      // Add API validation info to request
      req.apiValidation = {
        isValid: true,
        errors: result.errors,
        warnings: result.warnings
      };

      next();
    } catch (error) {
      console.error('API request validation error:', error);
      res.status(500).json({
        error: 'API validation error',
        message: 'Failed to validate API request',
        details: error.message
      });
    }
  };
};

/**
 * Error handling middleware for validation errors
 * @param {Error} error - Error object
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Next middleware function
 */
const validationErrorHandler = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.message,
      details: error.details || []
    });
  }

  if (error.name === 'SanitizationError') {
    return res.status(400).json({
      error: 'Sanitization error',
      message: error.message,
      details: error.details || []
    });
  }

  next(error);
};

/**
 * Get validation statistics
 * @returns {function} Express middleware
 */
const getValidationStats = (req, res) => {
  try {
    const stats = {
      availableSchemas: validationService.getAvailableSchemas(),
      timestamp: new Date().toISOString(),
      service: 'ValidationService'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting validation stats:', error);
    res.status(500).json({
      error: 'Failed to get validation statistics',
      message: error.message
    });
  }
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  validateAndSanitize,
  sanitizeData,
  validateFileUpload,
  validateApiRequest,
  validationErrorHandler,
  getValidationStats
};
