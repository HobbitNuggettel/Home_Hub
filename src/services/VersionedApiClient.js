/**
 * Versioned API Client
 * Handles API versioning on the client side with automatic fallbacks
 */

import apiVersioningService from './ApiVersioningService.js';
import loggingService from './LoggingService.js';

class VersionedApiClient {
  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.defaultVersion = 'v1';
    this.currentVersion = this.defaultVersion;
    this.supportedVersions = [this.defaultVersion];
    this.versionHeaders = {};
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    try {
      // Get version information from server
      const response = await fetch(`${this.baseUrl}/api/version-info`);
      if (response.ok) {
        const versionInfo = await response.json();
        this.currentVersion = versionInfo.current;
        this.supportedVersions = versionInfo.supported;
        this.versionHeaders = versionInfo.headers;
        
        loggingService.info('API client initialized with version info', { versionInfo });
      } else {
        loggingService.warn('Failed to get version info from server, using defaults');
      }
    } catch (error) {
      loggingService.error('Failed to initialize API client', { error: error.message });
    }
  }

  /**
   * Set API version
   * @param {string} version - API version to use
   */
  setVersion(version) {
    if (this.supportedVersions.includes(version)) {
      this.currentVersion = version;
      loggingService.info(`API version set to ${version}`);
    } else {
      loggingService.warn(`Version ${version} is not supported, keeping current version ${this.currentVersion}`);
    }
  }

  /**
   * Get current API version
   * @returns {string} Current version
   */
  getVersion() {
    return this.currentVersion;
  }

  /**
   * Get supported versions
   * @returns {Array} Supported versions
   */
  getSupportedVersions() {
    return [...this.supportedVersions];
  }

  /**
   * Create versioned API URL
   * @param {string} endpoint - API endpoint
   * @param {string} version - API version (optional)
   * @returns {string} Versioned URL
   */
  createVersionedUrl(endpoint, version = null) {
    const apiVersion = version || this.currentVersion;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/api/${apiVersion}/${cleanEndpoint}`;
  }

  /**
   * Get default headers with version information
   * @returns {object} Headers
   */
  getDefaultHeaders() {
    return {
      'Content-Type': 'application/json',
      'API-Version': this.currentVersion,
      'Accept': 'application/json',
      ...this.versionHeaders
    };
  }

  /**
   * Make API request with versioning
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      data = null,
      version = null,
      headers = {},
      retries = this.retryAttempts
    } = options;

    const url = this.createVersionedUrl(endpoint, version);
    const requestHeaders = {
      ...this.getDefaultHeaders(),
      ...headers
    };

    const requestOptions = {
      method,
      headers: requestHeaders,
      credentials: 'include'
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Handle version-related headers
      this.handleVersionHeaders(response);
      
      // Handle different response statuses
      if (response.ok) {
        const responseData = await response.json();
        return {
          success: true,
          data: responseData,
          version: this.currentVersion,
          headers: this.extractVersionHeaders(response)
        };
      } else if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.error === 'Invalid API version') {
          // Try with default version
          if (version !== this.defaultVersion && retries > 0) {
            loggingService.warn(`Version ${version} failed, retrying with default version`);
            return this.request(endpoint, { ...options, version: this.defaultVersion, retries: retries - 1 });
          }
        }
        throw new Error(errorData.message || 'Bad request');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found');
      } else if (response.status >= 500) {
        throw new Error('Server error');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      loggingService.error('API request failed', { 
        endpoint, 
        method, 
        version: version || this.currentVersion,
        error: error.message 
      });
      
      // Retry on network errors
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.retryDelay);
        return this.request(endpoint, { ...options, retries: retries - 1 });
      }
      
      throw error;
    }
  }

  /**
   * Handle version-related headers from response
   * @param {Response} response - Fetch response
   */
  handleVersionHeaders(response) {
    const apiVersion = response.headers.get('API-Version');
    const supportedVersions = response.headers.get('API-Supported-Versions');
    const deprecatedVersions = response.headers.get('API-Deprecated-Versions');
    const warning = response.headers.get('Warning');

    if (apiVersion && apiVersion !== this.currentVersion) {
      loggingService.info(`Server API version: ${apiVersion}, Client version: ${this.currentVersion}`);
    }

    if (supportedVersions) {
      const versions = supportedVersions.split(', ').map(v => v.trim());
      this.supportedVersions = versions;
    }

    if (deprecatedVersions) {
      const deprecated = deprecatedVersions.split(', ').map(v => v.trim()).filter(v => v);
      if (deprecated.includes(this.currentVersion)) {
        loggingService.warn(`Current API version ${this.currentVersion} is deprecated`);
      }
    }

    if (warning) {
      loggingService.warn(`API Warning: ${warning}`);
    }
  }

  /**
   * Extract version headers from response
   * @param {Response} response - Fetch response
   * @returns {object} Version headers
   */
  extractVersionHeaders(response) {
    return {
      apiVersion: response.headers.get('API-Version'),
      supportedVersions: response.headers.get('API-Supported-Versions'),
      deprecatedVersions: response.headers.get('API-Deprecated-Versions'),
      warning: response.headers.get('Warning')
    };
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} True if retryable
   */
  isRetryableError(error) {
    return error.name === 'TypeError' || 
           error.message.includes('network') ||
           error.message.includes('fetch');
  }

  /**
   * Delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', data });
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', data });
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request data
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', data });
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Request options
   * @returns {Promise} API response
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get API version information
   * @returns {Promise} Version information
   */
  async getVersionInfo() {
    try {
      const response = await this.get('/version-info');
      return response.data;
    } catch (error) {
      loggingService.error('Failed to get version info', { error: error.message });
      throw error;
    }
  }

  /**
   * Get API version statistics
   * @returns {Promise} Version statistics
   */
  async getVersionStats() {
    try {
      const response = await this.get('/version-stats');
      return response.data;
    } catch (error) {
      loggingService.error('Failed to get version stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get API version compatibility matrix
   * @returns {Promise} Compatibility matrix
   */
  async getCompatibilityMatrix() {
    try {
      const response = await this.get('/version-compatibility');
      return response.data;
    } catch (error) {
      loggingService.error('Failed to get compatibility matrix', { error: error.message });
      throw error;
    }
  }

  /**
   * Get migration guide for a version
   * @param {string} version - Version to get migration guide for
   * @returns {Promise} Migration guide
   */
  async getMigrationGuide(version) {
    try {
      const response = await this.get(`/version-migration-guide/${version}`);
      return response.data;
    } catch (error) {
      loggingService.error('Failed to get migration guide', { version, error: error.message });
      throw error;
    }
  }

  /**
   * Check if current version is deprecated
   * @returns {boolean} True if deprecated
   */
  isCurrentVersionDeprecated() {
    return this.supportedVersions.includes(this.currentVersion) === false;
  }

  /**
   * Get recommended version
   * @returns {string} Recommended version
   */
  getRecommendedVersion() {
    return this.supportedVersions[this.supportedVersions.length - 1] || this.defaultVersion;
  }

  /**
   * Migrate to recommended version
   */
  migrateToRecommendedVersion() {
    const recommended = this.getRecommendedVersion();
    if (recommended !== this.currentVersion) {
      this.setVersion(recommended);
      loggingService.info(`Migrated to recommended version: ${recommended}`);
    }
  }
}

// Create singleton instance
const versionedApiClient = new VersionedApiClient();

// Auto-initialize
versionedApiClient.initialize();

export default versionedApiClient;




