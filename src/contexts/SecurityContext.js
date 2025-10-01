/**
 * Security Context
 * Provides security utilities and monitoring across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import securityService from '../services/SecurityService';
import { securityMonitoring } from '../config/security';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [suspiciousActivity, setSuspiciousActivity] = useState({
    failedLogins: 0,
    suspiciousRequests: 0,
    rateLimitViolations: 0
  });

  /**
   * Log security event
   * @param {string} type - Event type
   * @param {object} data - Event data
   */
  const logSecurityEvent = useCallback((type, data) => {
    const event = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      severity: data.severity || 'info'
    };

    setSecurityAlerts(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events

    // Check alert thresholds
    if (securityMonitoring.logSuspiciousActivity) {
      checkAlertThresholds(type, data);
    }

    console.log(`Security Event [${type}]:`, event);
  }, []);

  /**
   * Check alert thresholds
   * @param {string} type - Event type
   * @param {object} data - Event data
   */
  const checkAlertThresholds = useCallback((type, data) => {
    const thresholds = securityMonitoring.alertThresholds;
    
    switch (type) {
      case 'failed_login':
        setSuspiciousActivity(prev => {
          const newCount = prev.failedLogins + 1;
          if (newCount >= thresholds.failedLogins) {
            logSecurityEvent('alert', {
              message: `Multiple failed login attempts detected (${newCount})`,
              severity: 'high',
              type: 'failed_logins'
            });
          }
          return { ...prev, failedLogins: newCount };
        });
        break;
        
      case 'suspicious_request':
        setSuspiciousActivity(prev => {
          const newCount = prev.suspiciousRequests + 1;
          if (newCount >= thresholds.suspiciousRequests) {
            logSecurityEvent('alert', {
              message: `Multiple suspicious requests detected (${newCount})`,
              severity: 'high',
              type: 'suspicious_requests'
            });
          }
          return { ...prev, suspiciousRequests: newCount };
        });
        break;
        
      case 'rate_limit_violation':
        setSuspiciousActivity(prev => {
          const newCount = prev.rateLimitViolations + 1;
          if (newCount >= thresholds.rateLimitViolations) {
            logSecurityEvent('alert', {
              message: `Multiple rate limit violations detected (${newCount})`,
              severity: 'medium',
              type: 'rate_limit_violations'
            });
          }
          return { ...prev, rateLimitViolations: newCount };
        });
        break;
    }
  }, [logSecurityEvent]);

  /**
   * Validate user input
   * @param {string} input - Input to validate
   * @param {string} field - Field name
   * @returns {object} - Validation result
   */
  const validateInput = useCallback((input, field) => {
    const sanitized = securityService.sanitizeInput(input);
    const suspiciousCheck = securityService.checkSuspiciousPatterns(input);
    
    if (suspiciousCheck.isSuspicious) {
      logSecurityEvent('suspicious_input', {
        field,
        input: input.substring(0, 100), // Truncate for logging
        threats: suspiciousCheck.threats,
        severity: suspiciousCheck.riskLevel === 'high' ? 'high' : 'medium'
      });
    }
    
    return {
      sanitized,
      isSuspicious: suspiciousCheck.isSuspicious,
      threats: suspiciousCheck.threats
    };
  }, [logSecurityEvent]);

  /**
   * Check rate limit
   * @param {string} action - Action type
   * @returns {boolean} - Whether action is allowed
   */
  const checkRateLimit = useCallback((action) => {
    const result = securityService.checkRateLimit('user', action);
    
    if (!result.allowed) {
      logSecurityEvent('rate_limit_violation', {
        action,
        limit: result.limit,
        resetTime: result.resetTime
      });
    }
    
    return result.allowed;
  }, [logSecurityEvent]);

  /**
   * Clear security alerts
   */
  const clearAlerts = useCallback(() => {
    setSecurityAlerts([]);
  }, []);

  /**
   * Clear specific alert
   * @param {string} alertId - Alert ID to clear
   */
  const clearAlert = useCallback((alertId) => {
    setSecurityAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  /**
   * Reset suspicious activity counters
   */
  const resetSuspiciousActivity = useCallback(() => {
    setSuspiciousActivity({
      failedLogins: 0,
      suspiciousRequests: 0,
      rateLimitViolations: 0
    });
  }, []);

  /**
   * Start security monitoring
   */
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    logSecurityEvent('monitoring_started', {
      message: 'Security monitoring started'
    });
  }, [logSecurityEvent]);

  /**
   * Stop security monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    logSecurityEvent('monitoring_stopped', {
      message: 'Security monitoring stopped'
    });
  }, [logSecurityEvent]);

  // Auto-start monitoring
  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  // Reset counters every hour
  useEffect(() => {
    const interval = setInterval(() => {
      resetSuspiciousActivity();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [resetSuspiciousActivity]);

  const value = {
    securityAlerts,
    isMonitoring,
    suspiciousActivity,
    logSecurityEvent,
    validateInput,
    checkRateLimit,
    clearAlerts,
    clearAlert,
    resetSuspiciousActivity,
    startMonitoring,
    stopMonitoring
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityContext;



