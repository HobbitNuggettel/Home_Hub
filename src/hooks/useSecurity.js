/**
 * useSecurity Hook
 * Provides security validation and sanitization for React components
 */

import { useState, useCallback, useRef } from 'react';
import securityService from '../services/SecurityService';

/**
 * Custom hook for form security validation
 * @param {object} schema - Validation schema
 * @returns {object} - Security validation utilities
 */
export const useSecurity = (schema = {}) => {
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const rateLimitRef = useRef({});

  /**
   * Validate form data
   * @param {object} formData - Form data to validate
   * @returns {Promise<object>} - Validation result
   */
  const validateForm = useCallback(async (formData) => {
    setIsValidating(true);
    setErrors({});

    try {
      const result = securityService.validateFormData(formData, schema);
      
      if (!result.isValid) {
        setErrors(result.errors);
        return { isValid: false, data: result.sanitizedData, errors: result.errors };
      }

      return { isValid: true, data: result.sanitizedData, errors: {} };
    } catch (error) {
      console.error('Validation error:', error);
      setErrors({ general: 'Validation failed. Please try again.' });
      return { isValid: false, data: formData, errors: { general: 'Validation failed' } };
    } finally {
      setIsValidating(false);
    }
  }, [schema]);

  /**
   * Sanitize input value
   * @param {string} value - Value to sanitize
   * @returns {string} - Sanitized value
   */
  const sanitizeInput = useCallback((value) => {
    return securityService.sanitizeInput(value);
  }, []);

  /**
   * Validate single field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {object} - Field validation result
   */
  const validateField = useCallback((field, value) => {
    const fieldSchema = schema[field];
    if (!fieldSchema) {
      return { isValid: true, error: null };
    }

    const sanitizedValue = sanitizeInput(value);

    // Required field check
    if (fieldSchema.required && (!value || value.trim() === '')) {
      return { isValid: false, error: `${field} is required` };
    }

    // Skip validation if field is empty and not required
    if (!value || value.trim() === '') {
      return { isValid: true, error: null };
    }

    // Type validation
    if (fieldSchema.type === 'email' && !securityService.validateEmail(sanitizedValue)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (fieldSchema.type === 'phone' && !securityService.validatePhone(sanitizedValue)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    if (fieldSchema.type === 'url' && !securityService.validateURL(sanitizedValue)) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Length validation
    if (fieldSchema.minLength && sanitizedValue.length < fieldSchema.minLength) {
      return { isValid: false, error: `${field} must be at least ${fieldSchema.minLength} characters` };
    }

    if (fieldSchema.maxLength && sanitizedValue.length > fieldSchema.maxLength) {
      return { isValid: false, error: `${field} must be no more than ${fieldSchema.maxLength} characters` };
    }

    // Pattern validation
    if (fieldSchema.pattern && !fieldSchema.pattern.test(sanitizedValue)) {
      return { isValid: false, error: fieldSchema.message || `${field} format is invalid` };
    }

    return { isValid: true, error: null };
  }, [schema, sanitizeInput]);

  /**
   * Check rate limit for user action
   * @param {string} action - Action type
   * @returns {boolean} - Whether action is allowed
   */
  const checkRateLimit = useCallback((action = 'form') => {
    const now = Date.now();
    const key = `${action}_${now}`;
    const userKey = 'user'; // In production, use actual user ID

    const rateLimitResult = securityService.checkRateLimit(userKey, action);
    return rateLimitResult.allowed;
  }, []);

  /**
   * Clear validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Set field error
   * @param {string} field - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear field error
   * @param {string} field - Field name
   */
  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validateForm,
    validateField,
    sanitizeInput,
    checkRateLimit,
    clearErrors,
    setFieldError,
    clearFieldError
  };
};

/**
 * Custom hook for password security
 * @returns {object} - Password security utilities
 */
export const usePasswordSecurity = () => {
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   */
  const validatePassword = useCallback((password) => {
    const result = securityService.validatePassword(password);
    setPasswordStrength(result);
    return result;
  }, []);

  /**
   * Generate secure password
   * @param {number} length - Password length
   * @returns {string} - Generated password
   */
  const generatePassword = useCallback((length = 12) => {
    return securityService.generateSecureToken(length);
  }, []);

  return {
    passwordStrength,
    validatePassword,
    generatePassword
  };
};

/**
 * Custom hook for input sanitization
 * @returns {object} - Input sanitization utilities
 */
export const useInputSanitization = () => {
  /**
   * Sanitize input on change
   * @param {Event} event - Input change event
   * @param {Function} setValue - State setter function
   */
  const handleInputChange = useCallback((event, setValue) => {
    const sanitizedValue = securityService.sanitizeInput(event.target.value);
    setValue(sanitizedValue);
  }, []);

  /**
   * Sanitize input value
   * @param {string} value - Value to sanitize
   * @returns {string} - Sanitized value
   */
  const sanitizeValue = useCallback((value) => {
    return securityService.sanitizeInput(value);
  }, []);

  /**
   * Check for suspicious patterns
   * @param {string} input - Input to check
   * @returns {object} - Security check result
   */
  const checkSuspiciousPatterns = useCallback((input) => {
    return securityService.checkSuspiciousPatterns(input);
  }, []);

  return {
    handleInputChange,
    sanitizeValue,
    checkSuspiciousPatterns
  };
};

export default useSecurity;
