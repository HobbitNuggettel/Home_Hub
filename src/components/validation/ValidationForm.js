/**
 * Validation Form Component
 * Provides form validation with real-time feedback
 */

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import useValidation from '../../hooks/useValidation';

const ValidationForm = ({
  children,
  schema,
  onSubmit,
  onValidationChange,
  initialData = {},
  validateOnChange = true,
  validateOnBlur = true,
  showWarnings = true,
  className = '',
  ...props
}) => {
  const {
    isValid,
    errors,
    warnings,
    isDirty,
    isTouched,
    validate,
    validateAndSanitize,
    validateField,
    resetValidation,
    getFieldErrors,
    getFieldWarnings,
    hasFieldErrors,
    hasFieldWarnings,
    isFieldValid,
    isFieldTouched,
    isFieldDirty,
    getFieldsWithErrors,
    getFieldsWithWarnings,
    getTouchedFields,
    getDirtyFields
  } = useValidation(schema);

  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Handle form data changes
  const handleDataChange = useCallback((fieldName, value) => {
    const newData = { ...formData, [fieldName]: value };
    setFormData(newData);

    // Validate field if validation is enabled
    if (validateOnChange) {
      validateField(fieldName, value);
    }

    // Notify parent of validation changes
    if (onValidationChange) {
      onValidationChange({
        isValid,
        errors,
        warnings,
        isDirty,
        isTouched,
        formData: newData
      });
    }
  }, [formData, validateOnChange, validateField, isValid, errors, warnings, isDirty, isTouched, onValidationChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName, value) => {
    if (validateOnBlur) {
      validateField(fieldName, value);
    }
  }, [validateOnBlur, validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setIsSubmitting(true);

    try {
      // Validate entire form
      const validationResult = validateAndSanitize(formData);
      
      if (!validationResult.isValid) {
        console.warn('Form validation failed:', validationResult.errors);
        return;
      }

      // Call onSubmit with validated and sanitized data
      if (onSubmit) {
        await onSubmit(validationResult.sanitizedData, validationResult);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAndSanitize, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setSubmitAttempted(false);
    resetValidation();
  }, [initialData, resetValidation]);

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange({
        isValid,
        errors,
        warnings,
        isDirty,
        isTouched,
        formData
      });
    }
  }, [isValid, errors, warnings, isDirty, isTouched, formData, onValidationChange]);

  // Get field error message
  const getFieldError = useCallback((fieldName) => {
    const fieldErrors = getFieldErrors(fieldName);
    return fieldErrors.length > 0 ? fieldErrors[0].message : null;
  }, [getFieldErrors]);

  // Get field warning message
  const getFieldWarning = useCallback((fieldName) => {
    const fieldWarnings = getFieldWarnings(fieldName);
    return fieldWarnings.length > 0 ? fieldWarnings[0].message : null;
  }, [getFieldWarnings]);

  // Get field validation state
  const getFieldValidationState = useCallback((fieldName) => {
    return {
      isValid: isFieldValid(fieldName),
      isTouched: isFieldTouched(fieldName),
      isDirty: isFieldDirty(fieldName),
      hasErrors: hasFieldErrors(fieldName),
      hasWarnings: hasFieldWarnings(fieldName),
      error: getFieldError(fieldName),
      warning: getFieldWarning(fieldName)
    };
  }, [isFieldValid, isFieldTouched, isFieldDirty, hasFieldErrors, hasFieldWarnings, getFieldError, getFieldWarning]);

  // Form context for child components
  const formContext = {
    formData,
    setFormData: handleDataChange,
    onFieldBlur: handleFieldBlur,
    getFieldValidationState,
    getFieldError,
    getFieldWarning,
    isSubmitting,
    submitAttempted,
    isValid,
    errors,
    warnings,
    isDirty,
    isTouched
  };

  return (
    <ValidationFormContext.Provider value={formContext}>
      <form
        onSubmit={handleSubmit}
        className={`validation-form ${className}`}
        {...props}
      >
        {children}
      </form>
    </ValidationFormContext.Provider>
  );
};

// Create form context
const ValidationFormContext = React.createContext();

export const useValidationForm = () => {
  const context = React.useContext(ValidationFormContext);
  if (!context) {
    throw new Error('useValidationForm must be used within a ValidationForm');
  }
  return context;
};

ValidationForm.propTypes = {
  children: PropTypes.node.isRequired,
  schema: PropTypes.string,
  onSubmit: PropTypes.func,
  onValidationChange: PropTypes.func,
  initialData: PropTypes.object,
  validateOnChange: PropTypes.bool,
  validateOnBlur: PropTypes.bool,
  showWarnings: PropTypes.bool,
  className: PropTypes.string
};

export default ValidationForm;




