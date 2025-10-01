/**
 * Validation Input Component
 * Provides input validation with real-time feedback
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle, Info, Eye, EyeOff } from 'lucide-react';
import { useValidationForm } from './ValidationForm';

const ValidationInput = ({
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  warningClassName = '',
  showValidationIcons = true,
  showPasswordToggle = false,
  ...props
}) => {
  const {
    formData,
    setFormData,
    onFieldBlur,
    getFieldValidationState,
    getFieldError,
    getFieldWarning,
    isSubmitting,
    submitAttempted
  } = useValidationForm();

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Get current value
  const currentValue = value !== undefined ? value : (formData[name] || '');

  // Get validation state
  const validationState = getFieldValidationState(name);
  const error = getFieldError(name);
  const warning = getFieldWarning(name);

  // Handle input change
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    
    // Update form data
    setFormData(name, newValue);
    
    // Call custom onChange if provided
    if (onChange) {
      onChange(event, newValue);
    }
  }, [name, setFormData, onChange]);

  // Handle input blur
  const handleBlur = useCallback((event) => {
    setIsFocused(false);
    
    // Validate field
    onFieldBlur(name, currentValue);
    
    // Call custom onBlur if provided
    if (onBlur) {
      onBlur(event, currentValue);
    }
  }, [name, currentValue, onFieldBlur, onBlur]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Get input type
  const getInputType = () => {
    if (type === 'password' && showPasswordToggle) {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcons || !validationState.isTouched) return null;

    if (validationState.hasErrors) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (validationState.hasWarnings) {
      return <Info className="h-4 w-4 text-yellow-500" />;
    } else if (validationState.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    return null;
  };

  // Get input classes
  const getInputClasses = () => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400';
    
    let stateClasses = '';
    if (validationState.hasErrors && (validationState.isTouched || submitAttempted)) {
      stateClasses = 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-600';
    } else if (validationState.hasWarnings && (validationState.isTouched || submitAttempted)) {
      stateClasses = 'border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 dark:border-yellow-600';
    } else if (validationState.isValid && validationState.isTouched) {
      stateClasses = 'border-green-300 focus:ring-green-500 focus:border-green-500 dark:border-green-600';
    } else {
      stateClasses = 'border-gray-300 dark:border-gray-600';
    }

    return `${baseClasses} ${stateClasses} ${inputClassName}`.trim();
  };

  // Get label classes
  const getLabelClasses = () => {
    const baseClasses = 'block text-sm font-medium text-gray-700 dark:text-gray-300';
    return `${baseClasses} ${labelClassName}`.trim();
  };

  // Get error classes
  const getErrorClasses = () => {
    const baseClasses = 'mt-1 text-sm text-red-600 dark:text-red-400';
    return `${baseClasses} ${errorClassName}`.trim();
  };

  // Get warning classes
  const getWarningClasses = () => {
    const baseClasses = 'mt-1 text-sm text-yellow-600 dark:text-yellow-400';
    return `${baseClasses} ${warningClassName}`.trim();
  };

  return (
    <div className={`validation-input ${className}`}>
      {label && (
        <label htmlFor={name} className={getLabelClasses()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={getInputType()}
          id={name}
          name={name}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled || isSubmitting}
          className={getInputClasses()}
          {...props}
        />
        
        {/* Validation Icon */}
        {getValidationIcon() && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
        
        {/* Password Toggle */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (validationState.isTouched || submitAttempted) && (
        <p className={getErrorClasses()} role="alert">
          {error}
        </p>
      )}
      
      {/* Warning Message */}
      {warning && (validationState.isTouched || submitAttempted) && (
        <p className={getWarningClasses()} role="alert">
          {warning}
        </p>
      )}
    </div>
  );
};

ValidationInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  warningClassName: PropTypes.string,
  showValidationIcons: PropTypes.bool,
  showPasswordToggle: PropTypes.bool
};

export default ValidationInput;
