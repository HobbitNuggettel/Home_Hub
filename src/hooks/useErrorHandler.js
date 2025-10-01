import { useCallback, useEffect, useState } from 'react';
import errorHandlerService from '../services/ErrorHandlerService';

/**
 * Hook for handling errors in React components
 * @param {object} options - Configuration options
 * @returns {object} Error handling utilities
 */
export const useErrorHandler = (options = {}) => {
  const [errors, setErrors] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    reportErrors = true,
    showNotifications = true,
    logToConsole = true
  } = options;

  // Handle component errors
  const handleError = useCallback((error, errorInfo = {}) => {
    const errorData = {
      type: 'componentError',
      message: error.message || 'Component Error',
      stack: error.stack,
      component: errorInfo.componentName || 'Unknown',
      props: errorInfo.props,
      state: errorInfo.state,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    // Add to local state
    setErrors(prev => [...prev, errorData]);

    // Report to service
    if (reportErrors) {
      errorHandlerService.handleError(errorData);
    }

    // Log to console
    if (logToConsole) {
      console.error('Component Error:', error, errorInfo);
    }

    // Show notification
    if (showNotifications) {
      this.showErrorNotification(errorData);
    }
  }, [reportErrors, showNotifications, logToConsole]);

  // Handle async errors
  const handleAsyncError = useCallback((error, context = {}) => {
    const errorData = {
      type: 'asyncError',
      message: error.message || 'Async Operation Error',
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    setErrors(prev => [...prev, errorData]);

    if (reportErrors) {
      errorHandlerService.handleError(errorData);
    }

    if (logToConsole) {
      console.error('Async Error:', error, context);
    }

    if (showNotifications) {
      this.showErrorNotification(errorData);
    }
  }, [reportErrors, showNotifications, logToConsole]);

  // Handle API errors
  const handleApiError = useCallback((error, request = {}) => {
    const errorData = {
      type: 'apiError',
      message: error.message || 'API Request Error',
      stack: error.stack,
      request: {
        url: request.url,
        method: request.method,
        status: error.status,
        statusText: error.statusText
      },
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    setErrors(prev => [...prev, errorData]);

    if (reportErrors) {
      errorHandlerService.handleError(errorData);
    }

    if (logToConsole) {
      console.error('API Error:', error, request);
    }

    if (showNotifications) {
      this.showErrorNotification(errorData);
    }
  }, [reportErrors, showNotifications, logToConsole]);

  // Show error notification
  const showErrorNotification = useCallback((errorData) => {
    // Use your notification system (toast, alert, etc.)
    if (window.showNotification) {
      window.showNotification({
        type: 'error',
        title: 'Error Occurred',
        message: errorData.message,
        duration: 5000
      });
    }
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Get error statistics
  const getErrorStats = useCallback(() => {
    return errorHandlerService.getErrorStats();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Retry failed operations when back online
  useEffect(() => {
    if (isOnline && errors.length > 0) {
      // Implement retry logic for failed operations
      console.log('Back online, retrying failed operations...');
    }
  }, [isOnline, errors.length]);

  return {
    errors,
    isOnline,
    handleError,
    handleAsyncError,
    handleApiError,
    clearErrors,
    getErrorStats
  };
};

/**
 * Hook for handling async operations with error handling
 * @param {function} asyncFunction - The async function to execute
 * @param {object} options - Configuration options
 * @returns {object} Async operation utilities
 */
export const useAsyncErrorHandler = (asyncFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleAsyncError } = useErrorHandler(options);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      return result;
    } catch (err) {
      setError(err);
      handleAsyncError(err, { functionName: asyncFunction.name, args });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, handleAsyncError]);

  return {
    execute,
    loading,
    error,
    setError
  };
};

/**
 * Hook for handling API calls with error handling
 * @param {object} options - Configuration options
 * @returns {object} API error handling utilities
 */
export const useApiErrorHandler = (options = {}) => {
  const { handleApiError } = useErrorHandler(options);

  const handleApiCall = useCallback(async (apiCall) => {
    try {
      const response = await apiCall();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      handleApiError(error, {
        url: error.url || 'Unknown',
        method: error.method || 'Unknown',
        status: error.status,
        statusText: error.statusText
      });
      throw error;
    }
  }, [handleApiError]);

  return {
    handleApiCall
  };
};

export default useErrorHandler;
