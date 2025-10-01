/**
 * SecureForm Component
 * A secure form component with built-in validation and sanitization
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSecurity, usePasswordSecurity, useInputSanitization } from '../../hooks/useSecurity';

const SecureForm = ({ 
  schema, 
  onSubmit, 
  children, 
  className = '',
  showPasswordStrength = false,
  rateLimitAction = 'form'
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    errors,
    isValidating,
    validateForm,
    validateField,
    sanitizeInput,
    checkRateLimit,
    clearErrors,
    setFieldError,
    clearFieldError
  } = useSecurity(schema);

  const {
    passwordStrength,
    validatePassword,
    generatePassword
  } = usePasswordSecurity();

  const {
    handleInputChange,
    sanitizeValue,
    checkSuspiciousPatterns
  } = useInputSanitization();

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Check rate limit
    if (!checkRateLimit(rateLimitAction)) {
      setFieldError('general', 'Too many requests. Please wait before trying again.');
      return;
    }

    setIsSubmitting(true);
    clearErrors();

    try {
      const validationResult = await validateForm(formData);
      
      if (!validationResult.isValid) {
        return;
      }

      // Check for suspicious patterns in all form data
      const suspiciousCheck = checkSuspiciousPatterns(JSON.stringify(formData));
      if (suspiciousCheck.isSuspicious) {
        setFieldError('general', 'Suspicious input detected. Please check your input and try again.');
        console.warn('Suspicious form submission detected:', suspiciousCheck);
        return;
      }

      await onSubmit(validationResult.data);
    } catch (error) {
      console.error('Form submission error:', error);
      setFieldError('general', 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, checkRateLimit, rateLimitAction, checkSuspiciousPatterns, onSubmit, setFieldError, clearErrors]);

  /**
   * Handle input change with sanitization
   * @param {string} field - Field name
   * @param {Event} event - Input change event
   */
  const handleFieldChange = useCallback((field, event) => {
    const value = event.target.value;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));

    // Clear field error when user starts typing
    clearFieldError(field);

    // Validate field in real-time
    const fieldValidation = validateField(field, sanitizedValue);
    if (!fieldValidation.isValid) {
      setFieldError(field, fieldValidation.error);
    }

    // Special handling for password fields
    if (field.toLowerCase().includes('password') && showPasswordStrength) {
      validatePassword(sanitizedValue);
    }
  }, [sanitizeInput, clearFieldError, validateField, setFieldError, showPasswordStrength, validatePassword]);

  /**
   * Handle input blur with validation
   * @param {string} field - Field name
   * @param {Event} event - Input blur event
   */
  const handleFieldBlur = useCallback((field, event) => {
    const value = event.target.value;
    const fieldValidation = validateField(field, value);
    
    if (!fieldValidation.isValid) {
      setFieldError(field, fieldValidation.error);
    }
  }, [validateField, setFieldError]);

  /**
   * Generate secure password
   */
  const handleGeneratePassword = useCallback(() => {
    const newPassword = generatePassword(12);
    setFormData(prev => ({
      ...prev,
      password: newPassword
    }));
    validatePassword(newPassword);
  }, [generatePassword, validatePassword]);

  return (
    <form onSubmit={handleSubmit} className={`secure-form ${className}`}>
      {children({
        formData,
        errors,
        isValidating,
        isSubmitting,
        passwordStrength,
        handleFieldChange,
        handleFieldBlur,
        handleGeneratePassword,
        sanitizeValue
      })}
    </form>
  );
};

SecureForm.propTypes = {
  schema: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  className: PropTypes.string,
  showPasswordStrength: PropTypes.bool,
  rateLimitAction: PropTypes.string
};

export default SecureForm;



