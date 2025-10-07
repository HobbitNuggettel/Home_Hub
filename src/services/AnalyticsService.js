/**
 * Analytics Service
 * Comprehensive analytics and user behavior tracking
 */

import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import loggingService from './LoggingService.js';

class AnalyticsService {
  constructor() {
    this.analytics = null;
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.pageViewQueue = [];
    this.eventQueue = [];
    this.userProperties = {};
    this.customDimensions = {};
    this.isOnline = navigator.onLine;

    this.initialize();
  }

  /**
   * Initialize analytics service
   */
  async initialize() {
    try {
      if (typeof window !== 'undefined' && window.firebase && window.firebase.app) {
        this.analytics = getAnalytics(window.firebase.app());
        this.isInitialized = true;

        // Set up online/offline listeners
        this.setupOnlineOfflineListeners();

        // Process queued events
        this.processQueuedEvents();

        loggingService.info('Analytics service initialized successfully');
      } else {
        loggingService.warn('Firebase not available, analytics will be queued');
      }
    } catch (error) {
      loggingService.error('Failed to initialize analytics service', { error: error.message });
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up online/offline listeners
   */
  setupOnlineOfflineListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Process queued events when online
   */
  processQueuedEvents() {
    if (!this.isOnline || !this.isInitialized) return;

    // Process page view queue
    while (this.pageViewQueue.length > 0) {
      const pageView = this.pageViewQueue.shift();
      this.trackPageView(pageView.page, pageView.title, pageView.properties);
    }

    // Process event queue
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.trackEvent(event.name, event.parameters);
    }
  }

  /**
   * Track page view
   */
  trackPageView(page, title, properties = {}) {
    const eventData = {
      page_title: title,
      page_location: window.location.href,
      page_path: page,
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...properties
    };

    if (this.isInitialized && this.analytics) {
      logEvent(this.analytics, 'page_view', eventData);
    } else {
      this.pageViewQueue.push({ page, title, properties: eventData });
    }

    loggingService.info('Page view tracked', { page, title });
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, parameters = {}) {
    const eventData = {
      session_id: this.sessionId,
      timestamp: Date.now(),
      ...this.userProperties,
      ...this.customDimensions,
      ...parameters
    };

    if (this.isInitialized && this.analytics) {
      logEvent(this.analytics, eventName, eventData);
    } else {
      this.eventQueue.push({ name: eventName, parameters: eventData });
    }

    loggingService.info('Event tracked', { eventName, parameters });
  }

  /**
   * Track user action
   */
  trackUserAction(action, category, label, value) {
    this.trackEvent('user_action', {
      action,
      category,
      label,
      value
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, location, properties = {}) {
    this.trackEvent('button_click', {
      button_name: buttonName,
      location,
      ...properties
    });
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName, success, properties = {}) {
    this.trackEvent('form_submission', {
      form_name: formName,
      success,
      ...properties
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm, resultsCount, category) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      search_category: category
    });
  }

  /**
   * Track navigation
   */
  trackNavigation(fromPage, toPage, method) {
    this.trackEvent('navigation', {
      from_page: fromPage,
      to_page: toPage,
      navigation_method: method
    });
  }

  /**
   * Track error
   */
  trackError(error, context, severity = 'error') {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
      severity,
      page: window.location.pathname
    });
  }

  /**
   * Track performance
   */
  trackPerformance(metricName, value, unit = 'ms') {
    this.trackEvent('performance', {
      metric_name: metricName,
      metric_value: value,
      metric_unit: unit
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(engagementType, duration, properties = {}) {
    this.trackEvent('engagement', {
      engagement_type: engagementType,
      duration,
      ...properties
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, action, properties = {}) {
    this.trackEvent('feature_usage', {
      feature_name: featureName,
      action,
      ...properties
    });
  }

  /**
   * Track conversion
   */
  trackConversion(conversionType, value, currency = 'USD') {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      currency
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    this.userProperties = { ...this.userProperties, ...properties };
    
    if (this.isInitialized && this.analytics) {
      setUserProperties(this.analytics, properties);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    if (this.isInitialized && this.analytics) {
      setUserId(this.analytics, userId);
    }
  }

  /**
   * Set custom dimensions
   */
  setCustomDimensions(dimensions) {
    this.customDimensions = { ...this.customDimensions, ...dimensions };
  }

  /**
   * Get analytics data
   */
  getAnalyticsData() {
    return {
      sessionId: this.sessionId,
      isInitialized: this.isInitialized,
      isOnline: this.isOnline,
      queuedEvents: this.eventQueue.length,
      queuedPageViews: this.pageViewQueue.length,
      userProperties: this.userProperties,
      customDimensions: this.customDimensions
    };
  }

  /**
   * Get spending analytics
   */
  async getSpendingAnalytics(userId, period = '30d') {
    try {
      // Mock spending analytics data
      const mockData = {
        totalSpending: 1250.50,
        averageDaily: 41.68,
        topCategories: [
          { name: 'Groceries', amount: 450.00, percentage: 36.0 },
          { name: 'Utilities', amount: 200.00, percentage: 16.0 },
          { name: 'Entertainment', amount: 150.00, percentage: 12.0 }
        ],
        spendingTrend: 'increasing',
        savingsRate: 15.2,
        insights: [
          'Your spending on groceries has increased by 12% this month',
          'Consider setting a budget for entertainment expenses',
          'Great job maintaining your savings rate above 15%'
        ],
        charts: {
          spendingByCategory: [
            { category: 'Groceries', amount: 450.00 },
            { category: 'Utilities', amount: 200.00 },
            { category: 'Entertainment', amount: 150.00 },
            { category: 'Transportation', amount: 100.00 },
            { category: 'Other', amount: 350.50 }
          ],
          monthlyTrend: [
            { month: 'Jan', spending: 1200.00 },
            { month: 'Feb', spending: 1100.00 },
            { month: 'Mar', spending: 1300.00 },
            { month: 'Apr', spending: 1250.50 }
          ]
        },
        period,
        userId,
        generatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error('Failed to get spending analytics:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Clear analytics data
   */
  clearAnalyticsData() {
    this.eventQueue = [];
    this.pageViewQueue = [];
    this.userProperties = {};
    this.customDimensions = {};
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;