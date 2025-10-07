/**
 * Security Middleware
 * Provides security measures for API endpoints
 */

import securityService from '../services/SecurityService.js';

/**
 * Rate limiting middleware
 * @param {string} type - Type of request for rate limiting
 * @returns {Function} - Express middleware function
 */
export const rateLimit = (type = 'api') => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitResult = securityService.checkRateLimit(identifier, type);

    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      });
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': rateLimitResult.limit,
      'X-RateLimit-Remaining': rateLimitResult.remaining,
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
    });

    next();
  };
};

/**
 * Input validation middleware
 * @param {object} schema - Validation schema
 * @returns {Function} - Express middleware function
 */
export const validateInput = (schema) => {
  return (req, res, next) => {
    const validationResult = securityService.validateFormData(req.body, schema);
    
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: validationResult.errors
      });
    }

    // Replace request body with sanitized data
    req.body = validationResult.sanitizedData;
    next();
  };
};

/**
 * Security headers middleware
 * @returns {Function} - Express middleware function
 */
export const securityHeaders = (req, res, next) => {
  const cspHeaders = securityService.generateCSPHeaders();
  
  // Set security headers
  Object.entries(cspHeaders).forEach(([key, value]) => {
    res.set(key, value);
  });

  next();
};

/**
 * Request logging middleware
 * @returns {Function} - Express middleware function
 */
export const requestLogging = (req, res, next) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    // Log suspicious requests
    if (res.statusCode >= 400) {
      console.warn('Suspicious request detected:', logData);
    } else {
      console.log('API Request:', logData);
    }

    originalSend.call(this, data);
  };

  next();
};

/**
 * CORS configuration
 * @returns {Function} - Express middleware function
 */
export const corsConfig = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com' // Replace with actual domain
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set({
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

/**
 * Request size limiting middleware
 * @param {number} limit - Size limit in bytes
 * @returns {Function} - Express middleware function
 */
export const requestSizeLimit = (limit = 1024 * 1024) => { // 1MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > limit) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: `Request size exceeds limit of ${limit} bytes`
      });
    }

    next();
  };
};

/**
 * SQL injection protection middleware
 * @returns {Function} - Express middleware function
 */
export const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
    /(UNION\s+SELECT)/i,
    /(DROP\s+TABLE)/i,
    /(INSERT\s+INTO)/i,
    /(DELETE\s+FROM)/i,
    /(UPDATE\s+SET)/i
  ];

  const checkInput = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return {
              isSuspicious: true,
              pattern: pattern.source,
              field: key,
              value: value
            };
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkInput(value);
        if (result.isSuspicious) {
          return result;
        }
      }
    }
    return { isSuspicious: false };
  };

  const result = checkInput(req.body);
  
  if (result.isSuspicious) {
    console.warn('SQL injection attempt detected:', {
      ip: req.ip,
      pattern: result.pattern,
      field: result.field,
      value: result.value,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      error: 'Bad Request',
      message: 'Suspicious input detected'
    });
  }

  next();
};

/**
 * XSS protection middleware
 * @returns {Function} - Express middleware function
 */
export const xssProtection = (req, res, next) => {
  const checkInput = (obj) => {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const securityCheck = securityService.checkSuspiciousPatterns(value);
        if (securityCheck.isSuspicious) {
          return {
            isSuspicious: true,
            threats: securityCheck.threats,
            field: key,
            value: value
          };
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkInput(value);
        if (result.isSuspicious) {
          return result;
        }
      }
    }
    return { isSuspicious: false };
  };

  const result = checkInput(req.body);
  
  if (result.isSuspicious) {
    console.warn('XSS attempt detected:', {
      ip: req.ip,
      threats: result.threats,
      field: result.field,
      value: result.value,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      error: 'Bad Request',
      message: 'Suspicious input detected'
    });
  }

  next();
};

/**
 * Authentication middleware
 * @returns {Function} - Express middleware function
 */
export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token required'
    });
  }

  // In production, verify the JWT token here
  // For now, just check if token exists
  if (token.length < 10) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication token'
    });
  }

  next();
};

/**
 * Admin authorization middleware
 * @returns {Function} - Express middleware function
 */
export const requireAdmin = (req, res, next) => {
  // In production, check user role from JWT token
  const userRole = req.headers['x-user-role'];
  
  if (userRole !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }

  next();
};




