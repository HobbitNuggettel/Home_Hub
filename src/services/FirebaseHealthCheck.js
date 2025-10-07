/**
 * Firebase Health Check Service
 * Monitors Firebase connectivity and service status
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

class FirebaseHealthCheckService {
  constructor() {
    this.healthStatus = {
      isConnected: false,
      lastCheck: null,
      responseTime: null,
      error: null
    };
  }

  /**
   * Check Firebase connectivity
   */
  async checkConnection() {
    const startTime = Date.now();
    
    try {
      // Try to read a test document
      const testDocRef = doc(db, '_health', 'test');
      await getDoc(testDocRef);
      
      const responseTime = Date.now() - startTime;
      
      this.healthStatus = {
        isConnected: true,
        lastCheck: new Date().toISOString(),
        responseTime,
        error: null
      };
      
      return {
        success: true,
        connected: true,
        responseTime,
        timestamp: this.healthStatus.lastCheck
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.healthStatus = {
        isConnected: false,
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error.message
      };
      
      return {
        success: false,
        connected: false,
        error: error.message,
        responseTime,
        timestamp: this.healthStatus.lastCheck
      };
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return { ...this.healthStatus };
  }

  /**
   * Check if Firebase is available
   */
  isAvailable() {
    return this.healthStatus.isConnected;
  }

  /**
   * Get connection quality based on response time
   */
  getConnectionQuality() {
    if (!this.healthStatus.isConnected) {
      return 'offline';
    }
    
    const responseTime = this.healthStatus.responseTime;
    
    if (responseTime < 500) {
      return 'excellent';
    } else if (responseTime < 1000) {
      return 'good';
    } else if (responseTime < 2000) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(intervalMs = 30000) {
    // Check immediately
    this.checkConnection();
    
    // Set up periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkConnection();
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get detailed health report
   */
  getHealthReport() {
    const quality = this.getConnectionQuality();
    const status = this.healthStatus;
    
    return {
      connected: status.isConnected,
      quality,
      responseTime: status.responseTime,
      lastCheck: status.lastCheck,
      error: status.error,
      recommendations: this.getRecommendations(quality)
    };
  }

  /**
   * Get recommendations based on connection quality
   */
  getRecommendations(quality) {
    const recommendations = [];
    
    if (quality === 'offline') {
      recommendations.push('Check your internet connection');
      recommendations.push('Verify Firebase configuration');
      recommendations.push('Try refreshing the page');
    } else if (quality === 'poor') {
      recommendations.push('Check your internet connection speed');
      recommendations.push('Consider using offline mode');
    } else if (quality === 'fair') {
      recommendations.push('Connection is slow but functional');
    }
    
    return recommendations;
  }
}

// Create singleton instance
const firebaseHealthCheck = new FirebaseHealthCheckService();

export default firebaseHealthCheck;
