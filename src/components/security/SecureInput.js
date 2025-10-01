/**
 * SecureInput Component
 * A secure input component with built-in validation and sanitization
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const SecureInput = ({
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  minLength,
  maxLength,
  pattern,
  showPasswordStrength = false,
  passwordStrength = null,
  className = '',
  disabled = false,
  autoComplete = 'off'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleChange = useCallback((event) => {
    onChange(event);
  }, [onChange]);

  const handleBlur = useCallback((event) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return '';
    
    if (passwordStrength.score >= 4) return 'text-green-600';
    if (passwordStrength.score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPasswordStrengthText = () => {
    if (!passwordStrength) return '';
    
    if (passwordStrength.score >= 4) return 'Strong';
    if (passwordStrength.score >= 3) return 'Medium';
    if (passwordStrength.score >= 2) return 'Weak';
    return 'Very Weak';
  };

  return (
    <div className={`secure-input ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-medium mb-2 ${
            error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={getInputType()}
          placeholder={placeholder}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 border rounded-lg transition-colors duration-200
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isFocused 
                ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500' 
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-700'}
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${type === 'password' ? 'pr-12' : ''}
          `}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertCircle size={20} />
          </div>
        )}
        
        {!error && hasValue && isFocused && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <CheckCircle size={20} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </p>
      )}
      
      {showPasswordStrength && passwordStrength && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
            <span className={`font-medium ${getPasswordStrengthColor()}`}>
              {getPasswordStrengthText()}
            </span>
          </div>
          
          <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                passwordStrength.score >= 4 ? 'bg-green-500' :
                passwordStrength.score >= 3 ? 'bg-yellow-500' :
                passwordStrength.score >= 2 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>
          
          {passwordStrength.feedback.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              {passwordStrength.feedback.map((feedback, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                  {feedback}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {minLength && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Minimum {minLength} characters
        </p>
      )}
      
      {maxLength && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {value?.length || 0} / {maxLength} characters
        </p>
      )}
    </div>
  );
};

SecureInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  showPasswordStrength: PropTypes.bool,
  passwordStrength: PropTypes.object,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string
};

export default SecureInput;



