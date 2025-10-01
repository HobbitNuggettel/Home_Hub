/**
 * Validation Context
 * Provides global validation state and functionality throughout the application
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import validationService from '../services/ValidationService';
import loggingService from '../services/LoggingService';

const ValidationContext = createContext();

export const useValidationContext = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidationContext must be used within a ValidationProvider');
  }
  return context;
};

export const ValidationProvider = ({ children }) => {
  const [globalValidationState, setGlobalValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    isDirty: false,
    isTouched: false
  });

  const [formStates, setFormStates] = useState({});
  const [fieldStates, setFieldStates] = useState({});

  /**
   * Validate data globally
   * @param {string} schemaName - Schema name
   * @param {any} data - Data to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result
   */
  const validateGlobal = useCallback((schemaName, data, options = {}) => {
    try {
      const result = validationService.validate(schemaName, data, options);
      
      setGlobalValidationState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        isDirty: true
      }));

      loggingService.info('Global validation performed', { 
        schema: schemaName, 
        isValid: result.isValid,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      loggingService.error('Global validation error', { 
        schema: schemaName, 
        error: error.message 
      });
      
      const errorResult = {
        isValid: false,
        data,
        errors: [{ field: 'global', message: error.message, type: 'global_validation_error' }],
        warnings: []
      };

      setGlobalValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: errorResult.errors,
        warnings: [],
        isDirty: true
      }));

      return errorResult;
    }
  }, []);

  /**
   * Validate and sanitize data globally
   * @param {string} schemaName - Schema name
   * @param {any} data - Data to validate and sanitize
   * @param {object} options - Validation options
   * @returns {object} Validation result with sanitized data
   */
  const validateAndSanitizeGlobal = useCallback((schemaName, data, options = {}) => {
    try {
      const result = validationService.validateAndSanitize(schemaName, data, options);
      
      setGlobalValidationState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        isDirty: true
      }));

      loggingService.info('Global validation and sanitization performed', { 
        schema: schemaName, 
        isValid: result.isValid,
        errorCount: result.errors.length
      });

      return result;
    } catch (error) {
      loggingService.error('Global validation and sanitization error', { 
        schema: schemaName, 
        error: error.message 
      });
      
      const errorResult = {
        isValid: false,
        data,
        sanitizedData: data,
        errors: [{ field: 'global', message: error.message, type: 'global_validation_error' }],
        warnings: []
      };

      setGlobalValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: errorResult.errors,
        warnings: [],
        isDirty: true
      }));

      return errorResult;
    }
  }, []);

  /**
   * Set form state
   * @param {string} formId - Form identifier
   * @param {object} state - Form state
   */
  const setFormState = useCallback((formId, state) => {
    setFormStates(prev => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        ...state,
        lastUpdated: Date.now()
      }
    }));
  }, []);

  /**
   * Get form state
   * @param {string} formId - Form identifier
   * @returns {object} Form state
   */
  const getFormState = useCallback((formId) => {
    return formStates[formId] || {
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false,
      isTouched: false
    };
  }, [formStates]);

  /**
   * Set field state
   * @param {string} fieldId - Field identifier
   * @param {object} state - Field state
   */
  const setFieldState = useCallback((fieldId, state) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        ...state,
        lastUpdated: Date.now()
      }
    }));
  }, []);

  /**
   * Get field state
   * @param {string} fieldId - Field identifier
   * @returns {object} Field state
   */
  const getFieldState = useCallback((fieldId) => {
    return fieldStates[fieldId] || {
      isValid: true,
      errors: [],
      warnings: [],
      isTouched: false,
      isDirty: false
    };
  }, [fieldStates]);

  /**
   * Validate field
   * @param {string} fieldId - Field identifier
   * @param {any} value - Field value
   * @param {string} schemaName - Schema name
   * @param {object} options - Validation options
   * @returns {object} Field validation result
   */
  const validateField = useCallback((fieldId, value, schemaName, options = {}) => {
    try {
      const result = validationService.validate(schemaName, { [fieldId]: value }, options);
      const fieldErrors = result.errors.filter(error => error.field === fieldId);
      const fieldWarnings = result.warnings.filter(warning => warning.field === fieldId);

      setFieldState(fieldId, {
        isValid: fieldErrors.length === 0,
        errors: fieldErrors,
        warnings: fieldWarnings,
        isTouched: true,
        isDirty: true
      });

      return {
        isValid: fieldErrors.length === 0,
        errors: fieldErrors,
        warnings: fieldWarnings
      };
    } catch (error) {
      loggingService.error('Field validation error', { 
        field: fieldId, 
        schema: schemaName,
        error: error.message 
      });
      
      const errorResult = {
        isValid: false,
        errors: [{ field: fieldId, message: error.message, type: 'field_validation_error' }],
        warnings: []
      };

      setFieldState(fieldId, {
        isValid: false,
        errors: errorResult.errors,
        warnings: [],
        isTouched: true,
        isDirty: true
      });

      return errorResult;
    }
  }, [setFieldState]);

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
   * Reset global validation state
   */
  const resetGlobalValidation = useCallback(() => {
    setGlobalValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false,
      isTouched: false
    });
    loggingService.info('Global validation state reset');
  }, []);

  /**
   * Reset form state
   * @param {string} formId - Form identifier
   */
  const resetFormState = useCallback((formId) => {
    setFormStates(prev => {
      const newState = { ...prev };
      delete newState[formId];
      return newState;
    });
    loggingService.info('Form state reset', { formId });
  }, []);

  /**
   * Reset field state
   * @param {string} fieldId - Field identifier
   */
  const resetFieldState = useCallback((fieldId) => {
    setFieldStates(prev => {
      const newState = { ...prev };
      delete newState[fieldId];
      return newState;
    });
    loggingService.info('Field state reset', { fieldId });
  }, []);

  /**
   * Reset all validation states
   */
  const resetAllValidation = useCallback(() => {
    setGlobalValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      isDirty: false,
      isTouched: false
    });
    setFormStates({});
    setFieldStates({});
    loggingService.info('All validation states reset');
  }, []);

  /**
   * Get validation statistics
   * @returns {object} Validation statistics
   */
  const getValidationStats = useCallback(() => {
    const formCount = Object.keys(formStates).length;
    const fieldCount = Object.keys(fieldStates).length;
    const totalErrors = Object.values(fieldStates).reduce((sum, state) => sum + (state.errors?.length || 0), 0);
    const totalWarnings = Object.values(fieldStates).reduce((sum, state) => sum + (state.warnings?.length || 0), 0);
    const invalidFields = Object.values(fieldStates).filter(state => !state.isValid).length;

    return {
      formCount,
      fieldCount,
      totalErrors,
      totalWarnings,
      invalidFields,
      globalIsValid: globalValidationState.isValid,
      globalErrors: globalValidationState.errors.length,
      globalWarnings: globalValidationState.warnings.length
    };
  }, [formStates, fieldStates, globalValidationState]);

  /**
   * Get all fields with errors
   * @returns {Array} Field IDs with errors
   */
  const getFieldsWithErrors = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldId => {
      const state = fieldStates[fieldId];
      return state.errors && state.errors.length > 0;
    });
  }, [fieldStates]);

  /**
   * Get all fields with warnings
   * @returns {Array} Field IDs with warnings
   */
  const getFieldsWithWarnings = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldId => {
      const state = fieldStates[fieldId];
      return state.warnings && state.warnings.length > 0;
    });
  }, [fieldStates]);

  /**
   * Get all invalid fields
   * @returns {Array} Invalid field IDs
   */
  const getInvalidFields = useCallback(() => {
    return Object.keys(fieldStates).filter(fieldId => {
      const state = fieldStates[fieldId];
      return !state.isValid;
    });
  }, [fieldStates]);

  // Memoized computed values
  const computedValues = useMemo(() => ({
    hasGlobalErrors: globalValidationState.errors.length > 0,
    hasGlobalWarnings: globalValidationState.warnings.length > 0,
    hasAnyFormErrors: Object.values(formStates).some(state => state.errors && state.errors.length > 0),
    hasAnyFieldErrors: Object.values(fieldStates).some(state => state.errors && state.errors.length > 0),
    hasAnyFieldWarnings: Object.values(fieldStates).some(state => state.warnings && state.warnings.length > 0),
    allFieldsValid: Object.values(fieldStates).every(state => state.isValid),
    anyFieldTouched: Object.values(fieldStates).some(state => state.isTouched),
    anyFieldDirty: Object.values(fieldStates).some(state => state.isDirty),
    totalForms: Object.keys(formStates).length,
    totalFields: Object.keys(fieldStates).length
  }), [globalValidationState, formStates, fieldStates]);

  const value = {
    // Global state
    globalValidationState,
    formStates,
    fieldStates,
    ...computedValues,

    // Actions
    validateGlobal,
    validateAndSanitizeGlobal,
    validateField,
    sanitize,
    setFormState,
    getFormState,
    setFieldState,
    getFieldState,
    resetGlobalValidation,
    resetFormState,
    resetFieldState,
    resetAllValidation,

    // Statistics and queries
    getValidationStats,
    getFieldsWithErrors,
    getFieldsWithWarnings,
    getInvalidFields,

    // Service access
    validationService
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

ValidationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ValidationContext;
