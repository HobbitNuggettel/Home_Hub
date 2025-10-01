/**
 * Security Service
 * Provides comprehensive security measures including input validation, sanitization, and security headers
 */

class SecurityService {
  constructor() {
    this.rateLimitStore = new Map();
    this.maxRequestsPerMinute = 60;
    this.maxRequestsPerHour = 1000;
  }

  /**
   * Sanitize user input to prevent XSS attacks
   * @param {string} input - User input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result with score and feedback
   */
  validatePassword(password) {
    const result = {
      isValid: false,
      score: 0,
      feedback: []
    };

    if (!password || password.length < 8) {
      result.feedback.push('Password must be at least 8 characters long');
      return result;
    }

    if (password.length >= 8) result.score += 1;
    if (/[a-z]/.test(password)) result.score += 1;
    if (/[A-Z]/.test(password)) result.score += 1;
    if (/[0-9]/.test(password)) result.score += 1;
    if (/[^A-Za-z0-9]/.test(password)) result.score += 1;

    if (result.score < 3) {
      result.feedback.push('Password should include uppercase, lowercase, numbers, and special characters');
    }

    result.isValid = result.score >= 3;
    return result;
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid phone number
   */
  validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid URL
   */
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rate limiting check
   * @param {string} identifier - User identifier (IP, user ID, etc.)
   * @param {string} type - Type of request (api, auth, etc.)
   * @returns {object} - Rate limit status
   */
  checkRateLimit(identifier, type = 'api') {
    const now = Date.now();
    const key = `${identifier}:${type}`;
    const requests = this.rateLimitStore.get(key) || [];

    // Clean old requests (older than 1 hour)
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);

    // Check hourly limit
    if (recentRequests.length >= this.maxRequestsPerHour) {
      return {
        allowed: false,
        limit: this.maxRequestsPerHour,
        remaining: 0,
        resetTime: Math.min(...recentRequests) + (60 * 60 * 1000)
      };
    }

    // Check minute limit
    const oneMinuteAgo = now - (60 * 1000);
    const minuteRequests = recentRequests.filter(timestamp => timestamp > oneMinuteAgo);

    if (minuteRequests.length >= this.maxRequestsPerMinute) {
      return {
        allowed: false,
        limit: this.maxRequestsPerMinute,
        remaining: 0,
        resetTime: Math.min(...minuteRequests) + (60 * 1000)
      };
    }

    // Add current request
    recentRequests.push(now);
    this.rateLimitStore.set(key, recentRequests);

    return {
      allowed: true,
      limit: this.maxRequestsPerMinute,
      remaining: this.maxRequestsPerMinute - minuteRequests.length - 1,
      resetTime: now + (60 * 1000)
    };
  }

  /**
   * Generate Content Security Policy headers
   * @returns {object} - CSP headers
   */
  generateCSPHeaders() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://firebaseapp.com https://*.firebaseapp.com wss://*.firebaseapp.com",
        "frame-src 'self' https://*.firebaseapp.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  /**
   * Validate and sanitize form data
   * @param {object} formData - Form data to validate
   * @param {object} schema - Validation schema
   * @returns {object} - Validation result
   */
  validateFormData(formData, schema) {
    const result = {
      isValid: true,
      errors: {},
      sanitizedData: {}
    };

    for (const [field, rules] of Object.entries(schema)) {
      const value = formData[field];
      const sanitizedValue = this.sanitizeInput(value);

      // Required field check
      if (rules.required && (!value || value.trim() === '')) {
        result.isValid = false;
        result.errors[field] = `${field} is required`;
        continue;
      }

      // Skip validation if field is empty and not required
      if (!value || value.trim() === '') {
        result.sanitizedData[field] = sanitizedValue;
        continue;
      }

      // Type validation
      if (rules.type === 'email' && !this.validateEmail(sanitizedValue)) {
        result.isValid = false;
        result.errors[field] = 'Invalid email format';
        continue;
      }

      if (rules.type === 'phone' && !this.validatePhone(sanitizedValue)) {
        result.isValid = false;
        result.errors[field] = 'Invalid phone number format';
        continue;
      }

      if (rules.type === 'url' && !this.validateURL(sanitizedValue)) {
        result.isValid = false;
        result.errors[field] = 'Invalid URL format';
        continue;
      }

      // Length validation
      if (rules.minLength && sanitizedValue.length < rules.minLength) {
        result.isValid = false;
        result.errors[field] = `${field} must be at least ${rules.minLength} characters`;
        continue;
      }

      if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
        result.isValid = false;
        result.errors[field] = `${field} must be no more than ${rules.maxLength} characters`;
        continue;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
        result.isValid = false;
        result.errors[field] = rules.message || `${field} format is invalid`;
        continue;
      }

      result.sanitizedData[field] = sanitizedValue;
    }

    return result;
  }

  /**
   * Generate secure random token
   * @param {number} length - Token length
   * @returns {string} - Secure random token
   */
  generateSecureToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
    
    return result;
  }

  /**
   * Hash sensitive data (simple implementation - use proper hashing in production)
   * @param {string} data - Data to hash
   * @returns {string} - Hashed data
   */
  hashData(data) {
    // In production, use a proper hashing library like bcrypt
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Check for suspicious patterns in input
   * @param {string} input - Input to check
   * @returns {object} - Security check result
   */
  checkSuspiciousPatterns(input) {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    const threats = [];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        threats.push(pattern.source);
      }
    }

    return {
      isSuspicious: threats.length > 0,
      threats: threats,
      riskLevel: threats.length > 3 ? 'high' : threats.length > 1 ? 'medium' : 'low'
    };
  }

  /**
   * Clean up old rate limit data
   */
  cleanupRateLimitData() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [key, requests] of this.rateLimitStore.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
      if (recentRequests.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, recentRequests);
      }
    }
  }
}

// Create singleton instance
const securityService = new SecurityService();

// Clean up rate limit data every hour
setInterval(() => {
  securityService.cleanupRateLimitData();
}, 60 * 60 * 1000);

export default securityService;



