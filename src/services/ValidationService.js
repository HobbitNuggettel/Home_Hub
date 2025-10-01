/**
 * Comprehensive Validation Service
 * Provides data validation, sanitization, and schema validation
 */

import Joi from 'joi';
import DOMPurify from 'dompurify';
import validator from 'validator';
import loggingService from './LoggingService';

class ValidationService {
  constructor() {
    this.schemas = new Map();
    this.customValidators = new Map();
    this.sanitizationRules = new Map();
    this.initializeDefaultSchemas();
    this.initializeSanitizationRules();
  }

  /**
   * Initialize default validation schemas
   */
  initializeDefaultSchemas() {
    // User schema
    this.schemas.set('user', Joi.object({
      id: Joi.string().uuid().optional(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/).required(),
      displayName: Joi.string().min(2).max(50).required(),
      firstName: Joi.string().min(2).max(50).optional(),
      lastName: Joi.string().min(2).max(50).optional(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      avatar: Joi.string().uri().optional(),
      role: Joi.string().valid('admin', 'user', 'guest').default('user'),
      isActive: Joi.boolean().default(true),
      lastLogin: Joi.date().iso().optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional()
    }));

    // Inventory item schema
    this.schemas.set('inventoryItem', Joi.object({
      id: Joi.string().uuid().optional(),
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      category: Joi.string().min(1).max(50).required(),
      quantity: Joi.number().integer().min(0).required(),
      price: Joi.number().min(0).precision(2).optional(),
      currency: Joi.string().length(3).uppercase().default('USD'),
      status: Joi.string().valid('active', 'inactive', 'low', 'out_of_stock').default('active'),
      supplier: Joi.string().max(100).optional(),
      purchaseDate: Joi.date().iso().optional(),
      expiryDate: Joi.date().iso().optional(),
      location: Joi.string().max(100).optional(),
      notes: Joi.string().max(1000).optional(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      images: Joi.array().items(Joi.string().uri()).max(5).optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional()
    }));

    // Spending transaction schema
    this.schemas.set('spendingTransaction', Joi.object({
      id: Joi.string().uuid().optional(),
      amount: Joi.number().min(0).precision(2).required(),
      currency: Joi.string().length(3).uppercase().default('USD'),
      description: Joi.string().min(1).max(200).required(),
      category: Joi.string().min(1).max(50).required(),
      subcategory: Joi.string().max(50).optional(),
      paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other').required(),
      merchant: Joi.string().max(100).optional(),
      location: Joi.string().max(100).optional(),
      date: Joi.date().iso().required(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      receipt: Joi.string().uri().optional(),
      notes: Joi.string().max(1000).optional(),
      isRecurring: Joi.boolean().default(false),
      recurringFrequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional()
    }));

    // Recipe schema
    this.schemas.set('recipe', Joi.object({
      id: Joi.string().uuid().optional(),
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      category: Joi.string().min(1).max(50).required(),
      cuisine: Joi.string().max(50).optional(),
      prepTime: Joi.number().integer().min(0).optional(),
      cookTime: Joi.number().integer().min(0).optional(),
      servings: Joi.number().integer().min(1).optional(),
      difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
      ingredients: Joi.array().items(Joi.object({
        name: Joi.string().min(1).max(100).required(),
        amount: Joi.number().min(0).optional(),
        unit: Joi.string().max(20).optional(),
        notes: Joi.string().max(100).optional()
      })).min(1).required(),
      instructions: Joi.array().items(Joi.string().min(1).max(1000)).min(1).required(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      images: Joi.array().items(Joi.string().uri()).max(5).optional(),
      nutrition: Joi.object({
        calories: Joi.number().min(0).optional(),
        protein: Joi.number().min(0).optional(),
        carbs: Joi.number().min(0).optional(),
        fat: Joi.number().min(0).optional(),
        fiber: Joi.number().min(0).optional(),
        sugar: Joi.number().min(0).optional()
      }).optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional()
    }));

    // Shopping list schema
    this.schemas.set('shoppingList', Joi.object({
      id: Joi.string().uuid().optional(),
      name: Joi.string().min(1).max(100).required(),
      description: Joi.string().max(500).optional(),
      items: Joi.array().items(Joi.object({
        name: Joi.string().min(1).max(100).required(),
        quantity: Joi.number().min(0).optional(),
        unit: Joi.string().max(20).optional(),
        category: Joi.string().max(50).optional(),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
        isCompleted: Joi.boolean().default(false),
        notes: Joi.string().max(200).optional()
      })).optional(),
      status: Joi.string().valid('draft', 'active', 'completed', 'cancelled').default('draft'),
      dueDate: Joi.date().iso().optional(),
      tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
      createdAt: Joi.date().iso().optional(),
      updatedAt: Joi.date().iso().optional()
    }));

    // API request schema
    this.schemas.set('apiRequest', Joi.object({
      method: Joi.string().valid('GET', 'POST', 'PUT', 'PATCH', 'DELETE').required(),
      endpoint: Joi.string().min(1).max(200).required(),
      headers: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      body: Joi.object().optional(),
      query: Joi.object().pattern(Joi.string(), Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())).optional(),
      params: Joi.object().pattern(Joi.string(), Joi.string()).optional()
    }));

    // File upload schema
    this.schemas.set('fileUpload', Joi.object({
      name: Joi.string().min(1).max(255).required(),
      size: Joi.number().min(1).max(10 * 1024 * 1024).required(), // 10MB max
      type: Joi.string().valid('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/csv', 'application/json').required(),
      lastModified: Joi.date().iso().optional()
    }));
  }

  /**
   * Initialize sanitization rules
   */
  initializeSanitizationRules() {
    // HTML sanitization rules
    this.sanitizationRules.set('html', {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      allowedAttributes: {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height']
      }
    });

    // SQL injection prevention rules
    this.sanitizationRules.set('sql', {
      dangerousPatterns: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/gi,
        /(\b(OR|AND)\s+".*"\s*=\s*".*")/gi,
        /(;|\-\-|\/\*|\*\/)/g
      ]
    });

    // XSS prevention rules
    this.sanitizationRules.set('xss', {
      dangerousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi
      ]
    });
  }

  /**
   * Validate data against a schema
   * @param {string} schemaName - Name of the schema
   * @param {object} data - Data to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  validate(schemaName, data, options = {}) {
    try {
      const schema = this.schemas.get(schemaName);
      if (!schema) {
        throw new Error(`Schema '${schemaName}' not found`);
      }

      const validationOptions = {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false,
        ...options
      };

      const { error, value, warning } = schema.validate(data, validationOptions);

      const result = {
        isValid: !error,
        data: value,
        errors: error ? error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
          value: detail.context?.value
        })) : [],
        warnings: warning ? warning.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        })) : []
      };

      if (error) {
        loggingService.warn('Validation failed', { 
          schema: schemaName, 
          errors: result.errors,
          data: this.sanitizeForLogging(data)
        });
      }

      return result;
    } catch (err) {
      loggingService.error('Validation error', { 
        schema: schemaName, 
        error: err.message,
        data: this.sanitizeForLogging(data)
      });
      
      return {
        isValid: false,
        data: null,
        errors: [{ field: 'validation', message: err.message, type: 'validation_error' }],
        warnings: []
      };
    }
  }

  /**
   * Sanitize data based on type
   * @param {any} data - Data to sanitize
   * @param {string} type - Sanitization type
   * @returns {any} Sanitized data
   */
  sanitize(data, type = 'general') {
    try {
      if (typeof data === 'string') {
        return this.sanitizeString(data, type);
      } else if (Array.isArray(data)) {
        return data.map(item => this.sanitize(item, type));
      } else if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this.sanitize(value, type);
        }
        return sanitized;
      }
      return data;
    } catch (err) {
      loggingService.error('Sanitization error', { type, error: err.message });
      return data;
    }
  }

  /**
   * Sanitize string data
   * @param {string} str - String to sanitize
   * @param {string} type - Sanitization type
   * @returns {string} Sanitized string
   */
  sanitizeString(str, type = 'general') {
    if (typeof str !== 'string') return str;

    let sanitized = str;

    // Trim whitespace
    sanitized = sanitized.trim();

    // HTML sanitization
    if (type === 'html' || type === 'general') {
      sanitized = DOMPurify.sanitize(sanitized, this.sanitizationRules.get('html'));
    }

    // XSS prevention
    if (type === 'xss' || type === 'general') {
      const xssRules = this.sanitizationRules.get('xss');
      for (const pattern of xssRules.dangerousPatterns) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // SQL injection prevention
    if (type === 'sql' || type === 'general') {
      const sqlRules = this.sanitizationRules.get('sql');
      for (const pattern of sqlRules.dangerousPatterns) {
        sanitized = sanitized.replace(pattern, '');
      }
    }

    // Email sanitization
    if (type === 'email') {
      sanitized = validator.normalizeEmail(sanitized) || sanitized;
    }

    // URL sanitization
    if (type === 'url') {
      sanitized = validator.escape(sanitized);
    }

    return sanitized;
  }

  /**
   * Validate and sanitize data
   * @param {string} schemaName - Schema name
   * @param {object} data - Data to validate and sanitize
   * @param {object} options - Options
   * @returns {object} Result with validated and sanitized data
   */
  validateAndSanitize(schemaName, data, options = {}) {
    // First sanitize the data
    const sanitizedData = this.sanitize(data, options.sanitizeType || 'general');
    
    // Then validate
    const validationResult = this.validate(schemaName, sanitizedData, options);
    
    return {
      ...validationResult,
      sanitizedData: sanitizedData
    };
  }

  /**
   * Add custom validation schema
   * @param {string} name - Schema name
   * @param {object} schema - Joi schema
   */
  addSchema(name, schema) {
    this.schemas.set(name, schema);
    loggingService.info(`Custom schema added: ${name}`);
  }

  /**
   * Add custom validator
   * @param {string} name - Validator name
   * @param {function} validator - Validator function
   */
  addCustomValidator(name, validator) {
    this.customValidators.set(name, validator);
    loggingService.info(`Custom validator added: ${name}`);
  }

  /**
   * Validate using custom validator
   * @param {string} name - Validator name
   * @param {any} data - Data to validate
   * @returns {object} Validation result
   */
  validateCustom(name, data) {
    const validator = this.customValidators.get(name);
    if (!validator) {
      throw new Error(`Custom validator '${name}' not found`);
    }

    try {
      const result = validator(data);
      return {
        isValid: result === true || (result && result.isValid),
        data: result?.data || data,
        errors: result?.errors || [],
        warnings: result?.warnings || []
      };
    } catch (err) {
      loggingService.error('Custom validation error', { validator: name, error: err.message });
      return {
        isValid: false,
        data: null,
        errors: [{ field: 'custom', message: err.message, type: 'custom_validation_error' }],
        warnings: []
      };
    }
  }

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {object} Validation result
   */
  validateEmail(email) {
    const isValid = validator.isEmail(email);
    return {
      isValid,
      data: isValid ? validator.normalizeEmail(email) : email,
      errors: isValid ? [] : [{ field: 'email', message: 'Invalid email format', type: 'email_validation' }],
      warnings: []
    };
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} Validation result
   */
  validatePassword(password) {
    const errors = [];
    const warnings = [];

    if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters long', type: 'password_length' });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter', type: 'password_lowercase' });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter', type: 'password_uppercase' });
    }

    if (!/\d/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one number', type: 'password_number' });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one special character', type: 'password_special' });
    }

    if (password.length < 12) {
      warnings.push({ field: 'password', message: 'Consider using a longer password for better security', type: 'password_length_warning' });
    }

    return {
      isValid: errors.length === 0,
      data: password,
      errors,
      warnings
    };
  }

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {object} Validation result
   */
  validateUrl(url) {
    const isValid = validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true
    });

    return {
      isValid,
      data: isValid ? url : null,
      errors: isValid ? [] : [{ field: 'url', message: 'Invalid URL format', type: 'url_validation' }],
      warnings: []
    };
  }

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {object} Validation result
   */
  validatePhone(phone) {
    const isValid = validator.isMobilePhone(phone);
    return {
      isValid,
      data: isValid ? phone : null,
      errors: isValid ? [] : [{ field: 'phone', message: 'Invalid phone number format', type: 'phone_validation' }],
      warnings: []
    };
  }

  /**
   * Sanitize data for logging (remove sensitive information)
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  sanitizeForLogging(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get all available schemas
   * @returns {Array} List of schema names
   */
  getAvailableSchemas() {
    return Array.from(this.schemas.keys());
  }

  /**
   * Get schema by name
   * @param {string} name - Schema name
   * @returns {object|null} Schema object
   */
  getSchema(name) {
    return this.schemas.get(name) || null;
  }

  /**
   * Remove schema
   * @param {string} name - Schema name
   * @returns {boolean} True if removed
   */
  removeSchema(name) {
    return this.schemas.delete(name);
  }

  /**
   * Clear all schemas
   */
  clearSchemas() {
    this.schemas.clear();
    loggingService.info('All validation schemas cleared');
  }
}

// Create singleton instance
const validationService = new ValidationService();

export default validationService;
