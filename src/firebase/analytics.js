import { 
  logEvent,
  setUserId,
  setUserProperties,
  setCurrentScreen,
  setAnalyticsCollectionEnabled,
  getAnalytics,
  isSupported,
  Analytics,
  AnalyticsCallOptions,
  EventNameString,
  CustomEventName,
  UserPropertyNameString,
  CustomUserPropertyName
} from 'firebase/analytics';
import { analytics } from './config';

// Firebase Analytics Service Class
class FirebaseAnalyticsService {
  constructor() {
    this.analytics = analytics;
    this.isEnabled = analytics !== null;
    this.userProperties = {};
    this.customEvents = new Map();
    this.performanceMetrics = new Map();
    
    if (this.analytics) {
      this.initializeAnalytics();
    } else {
      console.warn('⚠️ Firebase Analytics not available (demo mode)');
    }
  }

  // Initialize Analytics
  async initializeAnalytics() {
    if (!this.analytics) {
      console.warn('Analytics instance is null, skipping initialization');
      this.isEnabled = false;
      return;
    }

    try {
      // Check if analytics is supported
      const supported = await isSupported();
      if (!supported) {
        console.warn('Firebase Analytics is not supported in this environment');
        this.isEnabled = false;
        return;
      }

      // Enable analytics collection
      await setAnalyticsCollectionEnabled(this.analytics, true);
      
      console.log('Firebase Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
      this.isEnabled = false;
    }
  }

  // Basic Event Logging
  logEvent(eventName, eventParameters = {}) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return;
    }

    try {
      logEvent(this.analytics, eventName, eventParameters);
      
      // Store custom events for debugging
      if (eventName.startsWith('custom_')) {
        this.customEvents.set(eventName, {
          timestamp: Date.now(),
          parameters: eventParameters
        });
      }
      
      return {
        success: true,
        eventName,
        parameters: eventParameters,
        message: 'Event logged successfully!'
      };
    } catch (error) {
      console.error('Failed to log event:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // User Management
  setUserId(userId) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return;
    }

    try {
      setUserId(this.analytics, userId);
      
      return {
        success: true,
        userId,
        message: 'User ID set successfully!'
      };
    } catch (error) {
      console.error('Failed to set user ID:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  setUserProperty(name, value) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return;
    }

    try {
      setUserProperties(this.analytics, { [name]: value });
      
      // Store user properties locally
      this.userProperties[name] = value;
      
      return {
        success: true,
        property: name,
        value,
        message: 'User property set successfully!'
      };
    } catch (error) {
      console.error('Failed to set user property:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  setUserProperties(properties) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return;
    }

    try {
      setUserProperties(this.analytics, properties);
      
      // Store user properties locally
      Object.assign(this.userProperties, properties);
      
      return {
        success: true,
        properties,
        message: 'User properties set successfully!'
      };
    } catch (error) {
      console.error('Failed to set user properties:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Screen Tracking
  setCurrentScreen(screenName, screenClass = null) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return;
    }

    try {
      setCurrentScreen(this.analytics, screenName, screenClass);
      
      // Log screen view event
      this.logEvent('screen_view', {
        screen_name: screenName,
        screen_class: screenClass
      });
      
      return {
        success: true,
        screenName,
        screenClass,
        message: 'Current screen set successfully!'
      };
    } catch (error) {
      console.error('Failed to set current screen:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Custom Event Categories
  logPageView(pageName, pageCategory = null, additionalParams = {}) {
    return this.logEvent('page_view', {
      page_name: pageName,
      page_category: pageCategory,
      ...additionalParams
    });
  }

  logButtonClick(buttonName, buttonLocation = null, additionalParams = {}) {
    return this.logEvent('button_click', {
      button_name: buttonName,
      button_location: buttonLocation,
      ...additionalParams
    });
  }

  logFormSubmission(formName, formType = null, success = true, additionalParams = {}) {
    return this.logEvent('form_submission', {
      form_name: formName,
      form_type: formType,
      success,
      ...additionalParams
    });
  }

  logSearch(searchTerm, searchCategory = null, resultsCount = 0, additionalParams = {}) {
    return this.logEvent('search', {
      search_term: searchTerm,
      search_category: searchCategory,
      results_count: resultsCount,
      ...additionalParams
    });
  }

  logPurchase(transactionId, value, currency = 'USD', items = [], additionalParams = {}) {
    return this.logEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items: items.length,
      ...additionalParams
    });
  }

  logAddToCart(itemId, itemName, itemCategory = null, price = 0, quantity = 1, additionalParams = {}) {
    return this.logEvent('add_to_cart', {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
      quantity,
      ...additionalParams
    });
  }

  logRemoveFromCart(itemId, itemName, itemCategory = null, price = 0, quantity = 1, additionalParams = {}) {
    return this.logEvent('remove_from_cart', {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
      quantity,
      ...additionalParams
    });
  }

  logViewItem(itemId, itemName, itemCategory = null, price = 0, additionalParams = {}) {
    return this.logEvent('view_item', {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
      ...additionalParams
    });
  }

  logAddToWishlist(itemId, itemName, itemCategory = null, price = 0, additionalParams = {}) {
    return this.logEvent('add_to_wishlist', {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
      ...additionalParams
    });
  }

  logShare(contentType, contentId, method = null, additionalParams = {}) {
    return this.logEvent('share', {
      content_type: contentType,
      content_id: contentId,
      method,
      ...additionalParams
    });
  }

  logDownload(contentType, contentId, contentName = null, additionalParams = {}) {
    return this.logEvent('download', {
      content_type: contentType,
      content_id: contentId,
      content_name: contentName,
      ...additionalParams
    });
  }

  logVideoPlay(videoId, videoName = null, videoCategory = null, additionalParams = {}) {
    return this.logEvent('video_play', {
      video_id: videoId,
      video_name: videoName,
      video_category: videoCategory,
      ...additionalParams
    });
  }

  logVideoComplete(videoId, videoName = null, videoCategory = null, duration = 0, additionalParams = {}) {
    return this.logEvent('video_complete', {
      video_id: videoId,
      video_name: videoName,
      video_category: videoCategory,
      duration,
      ...additionalParams
    });
  }

  // Performance Monitoring
  startPerformanceTrace(traceName) {
    if (!this.isEnabled) {
      console.warn('Analytics is disabled');
      return null;
    }

    try {
      const trace = {
        name: traceName,
        startTime: performance.now(),
        attributes: {},
        metrics: {}
      };
      
      this.performanceMetrics.set(traceName, trace);
      
      return {
        success: true,
        traceName,
        message: 'Performance trace started!'
      };
    } catch (error) {
      console.error('Failed to start performance trace:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  addPerformanceAttribute(traceName, attributeName, attributeValue) {
    const trace = this.performanceMetrics.get(traceName);
    if (trace) {
      trace.attributes[attributeName] = attributeValue;
      return {
        success: true,
        traceName,
        attributeName,
        attributeValue,
        message: 'Performance attribute added successfully!'
      };
    }
    
    return {
      success: false,
      error: 'Performance trace not found'
    };
  }

  addPerformanceMetric(traceName, metricName, metricValue) {
    const trace = this.performanceMetrics.get(traceName);
    if (trace) {
      trace.metrics[metricName] = metricValue;
      return {
        success: true,
        traceName,
        metricName,
        metricValue,
        message: 'Performance metric added successfully!'
      };
    }
    
    return {
      success: false,
      error: 'Performance trace not found'
    };
  }

  stopPerformanceTrace(traceName) {
    const trace = this.performanceMetrics.get(traceName);
    if (trace) {
      const endTime = performance.now();
      const duration = endTime - trace.startTime;
      
      // Log performance event
      this.logEvent('performance_trace', {
        trace_name: traceName,
        duration,
        attributes: trace.attributes,
        metrics: trace.metrics
      });
      
      // Remove trace from memory
      this.performanceMetrics.delete(traceName);
      
      return {
        success: true,
        traceName,
        duration,
        message: 'Performance trace stopped and logged!'
      };
    }
    
    return {
      success: false,
      error: 'Performance trace not found'
    };
  }

  // Error Tracking
  logError(error, errorContext = {}, additionalParams = {}) {
    return this.logEvent('app_error', {
      error_message: error.message || 'Unknown error',
      error_stack: error.stack || '',
      error_name: error.name || 'Error',
      error_context: JSON.stringify(errorContext),
      ...additionalParams
    });
  }

  logCrash(error, errorContext = {}, additionalParams = {}) {
    return this.logEvent('app_crash', {
      error_message: error.message || 'Unknown error',
      error_stack: error.stack || '',
      error_name: error.name || 'Error',
      error_context: JSON.stringify(errorContext),
      ...additionalParams
    });
  }

  // User Engagement
  logUserEngagement(engagementType, engagementValue = null, additionalParams = {}) {
    return this.logEvent('user_engagement', {
      engagement_type: engagementType,
      engagement_value: engagementValue,
      ...additionalParams
    });
  }

  logSessionStart(sessionId = null, additionalParams = {}) {
    const session = sessionId || this.generateSessionId();
    return this.logEvent('session_start', {
      session_id: session,
      ...additionalParams
    });
  }

  logSessionEnd(sessionId = null, sessionDuration = 0, additionalParams = {}) {
    const session = sessionId || this.generateSessionId();
    return this.logEvent('session_end', {
      session_id: session,
      session_duration: sessionDuration,
      ...additionalParams
    });
  }

  // E-commerce Events
  logBeginCheckout(items = [], totalValue = 0, currency = 'USD', additionalParams = {}) {
    return this.logEvent('begin_checkout', {
      items: items.length,
      total_value: totalValue,
      currency,
      ...additionalParams
    });
  }

  logAddShippingInfo(shippingTier = null, additionalParams = {}) {
    return this.logEvent('add_shipping_info', {
      shipping_tier: shippingTier,
      ...additionalParams
    });
  }

  logAddPaymentInfo(paymentType = null, additionalParams = {}) {
    return this.logEvent('add_payment_info', {
      payment_type: paymentType,
      ...additionalParams
    });
  }

  logPurchaseRefund(transactionId, value, currency = 'USD', additionalParams = {}) {
    return this.logEvent('purchase_refund', {
      transaction_id: transactionId,
      value,
      currency,
      ...additionalParams
    });
  }

  // Utility Methods
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  getCustomEvents() {
    return Array.from(this.customEvents.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  getUserProperties() {
    return { ...this.userProperties };
  }

  clearCustomEvents() {
    this.customEvents.clear();
  }

  clearUserProperties() {
    this.userProperties = {};
  }

  // Analytics Control
  enableAnalytics() {
    this.isEnabled = true;
    setAnalyticsCollectionEnabled(this.analytics, true);
    return {
      success: true,
      message: 'Analytics enabled successfully!'
    };
  }

  disableAnalytics() {
    this.isEnabled = false;
    setAnalyticsCollectionEnabled(this.analytics, false);
    return {
      success: true,
      message: 'Analytics disabled successfully!'
    };
  }

  isAnalyticsEnabled() {
    return this.isEnabled;
  }

  // Error Handling
  getAnalyticsErrorMessage(errorCode) {
    const errorMessages = {
      'analytics/not-supported': 'Analytics is not supported in this environment.',
      'analytics/not-initialized': 'Analytics has not been initialized.',
      'analytics/collection-disabled': 'Analytics collection is disabled.',
      'analytics/invalid-parameter': 'Invalid parameter provided.',
      'analytics/network-error': 'Network error occurred while sending analytics data.',
      'analytics/quota-exceeded': 'Analytics quota exceeded.',
      'analytics/internal-error': 'Internal analytics error occurred.',
      'analytics/unknown': 'Unknown analytics error occurred.'
    };
    
    return errorMessages[errorCode] || 'An unexpected analytics error occurred. Please try again.';
  }
}

// Create and export singleton instance
export const firebaseAnalyticsService = new FirebaseAnalyticsService();

// Note: All methods are available through the firebaseAnalyticsService instance

export default firebaseAnalyticsService;
