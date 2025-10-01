/**
 * React Hook for Data Validation
 * Provides easy access to validation functionality in React components
 */

import { useState, useCallback, useMemo } from 'react';
import validationService from '../services/ValidationService';
import loggingService from '../services/LoggingService';

const useValidation = (schemaName = null, options = {}) => {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    isDirty: false,
    isTouched: false
  });

  const [fieldStates, setFieldStates] = useState({});

  /**
   * Validate data against schema
   * @param {any} data - Data to validate
   * @param {string} schema - Schema name (optional, uses default if not provided)
   * @param {object} validationOptions - Validation options
   * @returns {object} Validation result
   */
  const validate = useCallback((data, schema = schemaName, validationOptions = {}) => {
    if (!schema) {
      loggingService.warn('No schema provided for validation');
      return {
        isValid: true,
        data,
        errors: [],
        warnings: []
      };
    }

    try {
      const result = validationService.validate(schema, data, validationOptions);
      
      setValidationState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        isDirty: true
      }));

      return result;
    } catch (error) {
      loggingService.error('Validation error in hook', { error: error.message, schema });
      
      const errorResult = {
        isValid: false,
        data,
        errors: [{ field: 'validation', message: error.message, type: 'validation_error' }],
        warnings: []
      };

      setValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: errorResult.errors,
        warnings: [],
        isDirty: true
      }));

      return errorResult;
    }
  }, [schemaName]);

  /**
   * Validate and sanitize data
   * @param {any} data - Data to validate and sanitize
   * @param {string} schema - Schema name (optional)
   * @param {object} validationOptions - Validation options
   * @returns {object} Validation result with sanitized data
   */
  const validateAndSanitize = useCallback((data, schema = schemaName, validationOptions = {}) => {
    if (!schema) {
      loggingService.warn('No schema provided for validation and sanitization');
      return {
        isValid: true,
        data,
        sanitizedData: data,
        errors: [],
        warnings: []
      };
    }

    try {
      const result = validationService.validateAndSanitize(schema, data, validationOptions);
      
      setValidationState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        isDirty: true
      }));

      return result;
    } catch (error) {
      loggingService.error('Validation and sanitization error in hook', { error: error.message, schema });
      
      const errorResult = {
        isValid: false,
        data,
        sanitizedData: data,
        errors: [{ field: 'validation', message: error.message, type: 'validation_error' }],
        warnings: []
      };

      setValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: errorResult.errors,
        warnings: [],
        isDirty: true
      }));

      return errorResult;
    }
  }, [schemaName]);

  /**
   * Validate a specific field
   * @param {string} fieldName - Field name
   * @param {any} value - Field value
   * @param {string} fieldSchema - Field-specific schema (optional)
   * @returns {object} Field validation result
   */
  const validateField = useCallback((fieldName, value, fieldSchema = null) => {
    try {
      let result;
      
      if (fieldSchema) {
        result = validationService.validate(fieldSchema, { [fieldName]: value });
      } else if (schemaName) {
        result = validationService.validate(schemaName, { [fieldName]: value });
      } else {
        result = { isValid: true, data: { [fieldName]: value }, errors: [], warnings: [] };
      }

      const fieldErrors = result.errors.filter(error => error.field === fieldName);
      const fieldWarnings = result.warnings.filter(warning => warning.field === fieldName);

      setFieldStates(prev => ({
        ...prev,
        [fieldName]: {
          isValid: fieldErrors.length === 0,
          errors: fieldErrors,
          warnings: fieldWarnings,
          isTouched: true,
          isDirty: true
        }
      }));

      return {
        isValid: fieldErrors.length === 0,
        errors: fieldErrors,
        warnings: fieldWarnings
      };
    } catch (error) {
      loggingService.error('Field validation error', { field: fieldName, error: error.message });
      
      const errorResult = {
        isValid: false,
        errors: [{ field: fieldName, message: error.message, type: 'field_validation_error' }],
        warnings: []
      };

      setFieldStates(prev => ({
        ...prev,
        [fieldName]: {
          isValid: false,
          errors: errorResult.errors,
          warnings: [],
          isTouched: true,
          isDirty: true
        }
      }));

      return errorResult;
    }
  }, [schemaName]);

  /**
   * Sanitize data
   * @param {any} data - Data to sanitize
   * @param {string} type - Sanitization type
   * @returns {any} Sanitized data
   */
  const sanitize = useCallback((data, type = 'general') => {
    return validationService.sanitize(data, type);
  }, []);

  /**
   * Validate email
   * @param {string} email - Email to validate
   * @returns {object} Email validation result
   */
  const validateEmail = useCallback((email) => {
    return validationService.validateEmail(email);
  }, []);

  /**
   * Validate password
   * @param {string} password - Password to validate
   * @returns {object} Password validation result
   */
  const validatePassword = useCallback((password) => {
    return validationService.validatePassword(password);
  }, []);

  /**
   * Validate URL
   * @param {string} url - URL to validate
   * @returns {object} URL validation result
   */
  const validateUrl = useCallback((url) => {
    return validationService.validateUrl(url);
  }, []);

  /**
   * Validate phone number
   * @param {string} phone - Phone number to validate
   * @returns {object} Phone validation result
   */
  const validatePhone = useCallback((phone) => {
    return validationService.validatePhone(phone);
  }, []);

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false,
      isTouched: false
    });
    setFieldStates({});
  }, []);

  /**
   * Reset field state
   * @param {string} fieldName - Field name to reset
   */
  const resetField = useCallback((fieldName) => {
    setFieldStates(prev => {
      const newState = { ...prev };
      delete newState[fieldName];
      return newState;
    });
  }, []);

  /**
   * Mark field as touched
   * @param {string} fieldName - Field name
   */
  const touchField = useCallback((fieldName) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isTouched: true
      }
    }));
  }, []);

  /**
   * Mark all fields as touched
   */
  const touchAll = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      isTouched: true
    }));
  }, []);

  /**
   * Get field state
   * @param {string} fieldName - Field name
   * @returns {object} Field state
   */
  const getFieldState = useCallback((fieldName) => {
    return fieldStates[fieldName] || {
      isValid: true,
      errors: [],
      warnings: [],
      isTouched: false,
      isDirty: false
    };
  }, [fieldStates]);

  /**
   * Get field errors
   * @param {string} fieldName - Field name
   * @returns {Array} Field errors
   */
  const getFieldErrors = useCallback((fieldName) => {
    const fieldState = getFieldState(fieldName);
    return fieldState.errors || [];
  }, [getFieldState]);

  /**
   * Get field warnings
   * @param {string} fieldName - Field name
   * @returns {Array} Field warnings
   */
  const getFieldWarnings = useCallback((fieldName) => {
    const fieldState = getFieldState(fieldName);
    return fieldState.warnings || [];
  }, [getFieldState]);

  /**
   * Check if field has errors
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field has errors
   */
  const hasFieldErrors = useCallback((fieldName) => {
    const errors = getFieldErrors(fieldName);
    return errors.length > 0;
  }, [getFieldErrors]);

  /**
   * Check if field has warnings
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field has warnings
   */
  const hasFieldWarnings = useCallback((fieldName) => {
    const warnings = getFieldWarnings(fieldName);
    return warnings.length > 0;
  }, [getFieldWarnings]);

  /**
   * Check if field is valid
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field is valid
   */
  const isFieldValid = useCallback((fieldName) => {
    const fieldState = getFieldState(fieldName);
    return fieldState.isValid;
  }, [getFieldState]);

  /**
   * Check if field is touched
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field is touched
   */
  const isFieldTouched = useCallback((fieldName) => {
    const fieldState = getFieldState(fieldName);
    return fieldState.isTouched;
  }, [getFieldState]);

  /**
   * Check if field is dirty
   * @param {string} fieldName - Field name
   * @returns {boolean} True if field is dirty
   */
  const isFieldDirty = useCallback((fieldName) => {
    const fieldState = getFieldState(fieldName);
    return fieldState.isDirty;
  }, [getFieldState]);

  /**
   * Get all field names with errors
   * @returns {Array} Field names with errors
   */
  const getFieldsWithErrors = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldName => hasFieldErrors(fieldName));
  }, [fieldStates, hasFieldErrors]);

  /**
   * Get all field names with warnings
   * @returns {Array} Field names with warnings
   */
  const getFieldsWithWarnings = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldName => hasFieldWarnings(fieldName));
  }, [fieldStates, hasFieldWarnings]);

  /**
   * Get all touched fields
   * @returns {Array} Touched field names
   */
  const getTouchedFields = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldName => isFieldTouched(fieldName));
  }, [fieldStates, isFieldTouched]);

  /**
   * Get all dirty fields
   * @returns {Array} Dirty field names
   */
  const getDirtyFields = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldName => isFieldDirty(fieldName));
  }, [fieldStates, isFieldDirty]);

  // Memoized computed values
  const computedValues = useMemo(() => ({
    hasErrors: validationState.errors.length > 0,
    hasWarnings: validationState.warnings.length > 0,
    hasAnyFieldErrors: Object.values(fieldStates).some(state => state.errors && state.errors.length > 0),
    hasAnyFieldWarnings: Object.values(fieldStates).some(state => state.warnings && state.warnings.length > 0),
    allFieldsValid: Object.values(fieldStates).every(state => state.isValid),
    anyFieldTouched: Object.values(fieldStates).some(state => state.isTouched),
    anyFieldDirty: Object.values(fieldStates).some(state => state.isDirty)
  }), [validationState, fieldStates]);

  return {
    // State
    ...validationState,
    fieldStates,
    ...computedValues,

    // Actions
    validate,
    validateAndSanitize,
    validateField,
    sanitize,
    validateEmail,
    validatePassword,
    validateUrl,
    validatePhone,
    resetValidation,
    resetField,
    touchField,
    touchAll,

    // Field state getters
    getFieldState,
    getFieldErrors,
    getFieldWarnings,
    hasFieldErrors,
    hasFieldWarnings,
    isFieldValid,
    isFieldTouched,
    isFieldDirty,

    // Field collections
    getFieldsWithErrors,
    getFieldsWithWarnings,
    getTouchedFields,
    getDirtyFields
  };
};

export default useValidation;
