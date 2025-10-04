/**
 * Analytics Context
 * Provides analytics functionality throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import analyticsService from '../services/AnalyticsService';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(true);

  // Initialize analytics
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await analyticsService.initialize();
        setIsInitialized(true);
        
        // Set user properties if user is logged in
        if (currentUser) {
          analyticsService.setUserId(currentUser.uid);
          analyticsService.setUserProperties({
            user_id: currentUser.uid,
            email: currentUser.email,
            created_at: currentUser.metadata?.creationTime
          });
        }
        
        // Update analytics data
        setAnalyticsData(analyticsService.getAnalyticsData());
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
      }
    };

    initAnalytics();
  }, [currentUser]);

  // Update analytics data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyticsData(analyticsService.getAnalyticsData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Track page view
  const trackPageView = useCallback((page, title, properties = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackPageView(page, title, properties);
  }, [isTrackingEnabled]);

  // Track event
  const trackEvent = useCallback((eventName, parameters = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackEvent(eventName, parameters);
  }, [isTrackingEnabled]);

  // Track user action
  const trackUserAction = useCallback((action, category, label, value) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackUserAction(action, category, label, value);
  }, [isTrackingEnabled]);

  // Track button click
  const trackButtonClick = useCallback((buttonName, location, properties = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackButtonClick(buttonName, location, properties);
  }, [isTrackingEnabled]);

  // Track form submission
  const trackFormSubmission = useCallback((formName, success, properties = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackFormSubmission(formName, success, properties);
  }, [isTrackingEnabled]);

  // Track search
  const trackSearch = useCallback((searchTerm, resultsCount, category) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackSearch(searchTerm, resultsCount, category);
  }, [isTrackingEnabled]);

  // Track navigation
  const trackNavigation = useCallback((fromPage, toPage, method) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackNavigation(fromPage, toPage, method);
  }, [isTrackingEnabled]);

  // Track error
  const trackError = useCallback((error, context, severity = 'error') => {
    if (!isTrackingEnabled) return;
    analyticsService.trackError(error, context, severity);
  }, [isTrackingEnabled]);

  // Track performance
  const trackPerformance = useCallback((metricName, value, unit = 'ms') => {
    if (!isTrackingEnabled) return;
    analyticsService.trackPerformance(metricName, value, unit);
  }, [isTrackingEnabled]);

  // Track engagement
  const trackEngagement = useCallback((engagementType, duration, properties = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackEngagement(engagementType, duration, properties);
  }, [isTrackingEnabled]);

  // Track feature usage
  const trackFeatureUsage = useCallback((featureName, action, properties = {}) => {
    if (!isTrackingEnabled) return;
    analyticsService.trackFeatureUsage(featureName, action, properties);
  }, [isTrackingEnabled]);

  // Track conversion
  const trackConversion = useCallback((conversionType, value, currency = 'USD') => {
    if (!isTrackingEnabled) return;
    analyticsService.trackConversion(conversionType, value, currency);
  }, [isTrackingEnabled]);

  // Set user properties
  const setUserProperties = useCallback((properties) => {
    analyticsService.setUserProperties(properties);
    setAnalyticsData(analyticsService.getAnalyticsData());
  }, []);

  // Set custom dimensions
  const setCustomDimensions = useCallback((dimensions) => {
    analyticsService.setCustomDimensions(dimensions);
    setAnalyticsData(analyticsService.getAnalyticsData());
  }, []);

  // Toggle tracking
  const toggleTracking = useCallback((enabled) => {
    setIsTrackingEnabled(enabled);
    if (enabled) {
      analyticsService.processQueuedEvents();
    }
  }, []);

  // Clear analytics data
  const clearAnalyticsData = useCallback(() => {
    analyticsService.clearAnalyticsData();
    setAnalyticsData(analyticsService.getAnalyticsData());
  }, []);

  const value = {
    // State
    isInitialized,
    analyticsData,
    isTrackingEnabled,
    
    // Tracking functions
    trackPageView,
    trackEvent,
    trackUserAction,
    trackButtonClick,
    trackFormSubmission,
    trackSearch,
    trackNavigation,
    trackError,
    trackPerformance,
    trackEngagement,
    trackFeatureUsage,
    trackConversion,
    
    // Configuration functions
    setUserProperties,
    setCustomDimensions,
    toggleTracking,
    clearAnalyticsData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

AnalyticsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AnalyticsContext;




