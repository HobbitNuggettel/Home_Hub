/**
 * API Versioning Service
 * Manages API versioning, backward compatibility, and migration strategies
 */

import loggingService from './LoggingService.js';

class ApiVersioningService {
  constructor() {
    this.currentVersion = 'v1';
    this.supportedVersions = ['v1'];
    this.deprecatedVersions = [];
    this.versionStrategies = {
      v1: {
        version: 'v1',
        status: 'current',
        releaseDate: '2024-01-01',
        deprecationDate: null,
        sunsetDate: null,
        breakingChanges: [],
        newFeatures: [],
        migrationGuide: null
      }
    };
    this.versionHeaders = {
      'API-Version': this.currentVersion,
      'API-Supported-Versions': this.supportedVersions.join(', '),
      'API-Deprecated-Versions': this.deprecatedVersions.join(', ')
    };
  }

  /**
   * Get current API version
   * @returns {string} Current version
   */
  getCurrentVersion() {
    return this.currentVersion;
  }

  /**
   * Get all supported versions
   * @returns {Array} Supported versions
   */
  getSupportedVersions() {
    return [...this.supportedVersions];
  }

  /**
   * Get deprecated versions
   * @returns {Array} Deprecated versions
   */
  getDeprecatedVersions() {
    return [...this.deprecatedVersions];
  }

  /**
   * Check if version is supported
   * @param {string} version - Version to check
   * @returns {boolean} True if supported
   */
  isVersionSupported(version) {
    return this.supportedVersions.includes(version);
  }

  /**
   * Check if version is deprecated
   * @param {string} version - Version to check
   * @returns {boolean} True if deprecated
   */
  isVersionDeprecated(version) {
    return this.deprecatedVersions.includes(version);
  }

  /**
   * Get version strategy information
   * @param {string} version - Version to get info for
   * @returns {object|null} Version strategy info
   */
  getVersionStrategy(version) {
    return this.versionStrategies[version] || null;
  }

  /**
   * Get version headers for API responses
   * @returns {object} Version headers
   */
  getVersionHeaders() {
    return { ...this.versionHeaders };
  }

  /**
   * Add a new API version
   * @param {string} version - New version
   * @param {object} strategy - Version strategy
   */
  addVersion(version, strategy) {
    if (this.supportedVersions.includes(version)) {
      throw new Error(`Version ${version} already exists`);
    }

    this.supportedVersions.push(version);
    this.versionStrategies[version] = {
      version,
      status: 'current',
      releaseDate: new Date().toISOString().split('T')[0],
      deprecationDate: null,
      sunsetDate: null,
      breakingChanges: [],
      newFeatures: [],
      migrationGuide: null,
      ...strategy
    };

    // Update current version
    this.currentVersion = version;
    this.updateVersionHeaders();

    loggingService.info(`New API version added: ${version}`, { version, strategy });
  }

  /**
   * Deprecate a version
   * @param {string} version - Version to deprecate
   * @param {string} deprecationDate - Deprecation date
   * @param {string} sunsetDate - Sunset date
   */
  deprecateVersion(version, deprecationDate = null, sunsetDate = null) {
    if (!this.supportedVersions.includes(version)) {
      throw new Error(`Version ${version} is not supported`);
    }

    if (version === this.currentVersion) {
      throw new Error('Cannot deprecate current version');
    }

    // Move to deprecated versions
    this.supportedVersions = this.supportedVersions.filter(v => v !== version);
    this.deprecatedVersions.push(version);

    // Update version strategy
    if (this.versionStrategies[version]) {
      this.versionStrategies[version].status = 'deprecated';
      this.versionStrategies[version].deprecationDate = deprecationDate || new Date().toISOString().split('T')[0];
      this.versionStrategies[version].sunsetDate = sunsetDate;
    }

    this.updateVersionHeaders();

    loggingService.warn(`API version deprecated: ${version}`, { 
      version, 
      deprecationDate, 
      sunsetDate 
    });
  }

  /**
   * Update version headers
   */
  updateVersionHeaders() {
    this.versionHeaders = {
      'API-Version': this.currentVersion,
      'API-Supported-Versions': this.supportedVersions.join(', '),
      'API-Deprecated-Versions': this.deprecatedVersions.join(', ')
    };
  }

  /**
   * Get version compatibility matrix
   * @returns {object} Compatibility matrix
   */
  getCompatibilityMatrix() {
    const matrix = {};
    
    for (const version of this.supportedVersions) {
      matrix[version] = {
        status: 'supported',
        features: this.getVersionFeatures(version),
        breakingChanges: this.versionStrategies[version]?.breakingChanges || [],
        migrationPath: this.getMigrationPath(version)
      };
    }

    for (const version of this.deprecatedVersions) {
      matrix[version] = {
        status: 'deprecated',
        features: this.getVersionFeatures(version),
        breakingChanges: this.versionStrategies[version]?.breakingChanges || [],
        migrationPath: this.getMigrationPath(version),
        deprecationDate: this.versionStrategies[version]?.deprecationDate,
        sunsetDate: this.versionStrategies[version]?.sunsetDate
      };
    }

    return matrix;
  }

  /**
   * Get features for a version
   * @param {string} version - Version to get features for
   * @returns {Array} Features list
   */
  getVersionFeatures(version) {
    const strategy = this.versionStrategies[version];
    if (!strategy) return [];

    return [
      ...strategy.newFeatures,
      ...this.getInheritedFeatures(version)
    ];
  }

  /**
   * Get inherited features from previous versions
   * @param {string} version - Version to get inherited features for
   * @returns {Array} Inherited features
   */
  getInheritedFeatures(version) {
    const features = [];
    const versionIndex = this.supportedVersions.indexOf(version);
    
    if (versionIndex > 0) {
      for (let i = 0; i < versionIndex; i++) {
        const prevVersion = this.supportedVersions[i];
        const prevStrategy = this.versionStrategies[prevVersion];
        if (prevStrategy) {
          features.push(...prevStrategy.newFeatures);
        }
      }
    }

    return features;
  }

  /**
   * Get migration path for a version
   * @param {string} version - Version to get migration path for
   * @returns {object|null} Migration path
   */
  getMigrationPath(version) {
    const strategy = this.versionStrategies[version];
    if (!strategy) return null;

    return {
      from: version,
      to: this.currentVersion,
      breakingChanges: strategy.breakingChanges,
      migrationSteps: this.generateMigrationSteps(version),
      migrationGuide: strategy.migrationGuide
    };
  }

  /**
   * Generate migration steps for a version
   * @param {string} version - Version to generate steps for
   * @returns {Array} Migration steps
   */
  generateMigrationSteps(version) {
    const steps = [];
    const strategy = this.versionStrategies[version];
    
    if (!strategy) return steps;

    // Add general migration steps
    steps.push({
      step: 1,
      title: 'Update API endpoints',
      description: `Change all API calls from /api/${version}/ to /api/${this.currentVersion}/`,
      priority: 'high'
    });

    steps.push({
      step: 2,
      title: 'Update request/response formats',
      description: 'Review and update data structures according to breaking changes',
      priority: 'high'
    });

    steps.push({
      step: 3,
      title: 'Test compatibility',
      description: 'Test all API endpoints with new version',
      priority: 'medium'
    });

    steps.push({
      step: 4,
      title: 'Update documentation',
      description: 'Update API documentation and client code',
      priority: 'low'
    });

    return steps;
  }

  /**
   * Validate API request version
   * @param {string} version - Requested version
   * @returns {object} Validation result
   */
  validateVersion(version) {
    const result = {
      valid: false,
      supported: false,
      deprecated: false,
      current: false,
      message: '',
      recommendations: []
    };

    if (!version) {
      result.message = 'API version is required';
      result.recommendations.push('Include API-Version header in your request');
      return result;
    }

    result.supported = this.isVersionSupported(version);
    result.deprecated = this.isVersionDeprecated(version);
    result.current = version === this.currentVersion;

    if (result.supported) {
      result.valid = true;
      result.message = 'Version is supported';
      
      if (result.deprecated) {
        result.message += ' but is deprecated';
        result.recommendations.push(`Migrate to version ${this.currentVersion}`);
        result.recommendations.push('Check migration guide for breaking changes');
      }
    } else {
      result.message = `Version ${version} is not supported`;
      result.recommendations.push(`Use one of the supported versions: ${this.supportedVersions.join(', ')}`);
      result.recommendations.push(`Current version: ${this.currentVersion}`);
    }

    return result;
  }

  /**
   * Get API version information for client
   * @returns {object} Version information
   */
  getVersionInfo() {
    return {
      current: this.currentVersion,
      supported: this.supportedVersions,
      deprecated: this.deprecatedVersions,
      compatibility: this.getCompatibilityMatrix(),
      headers: this.getVersionHeaders()
    };
  }

  /**
   * Create versioned API endpoint
   * @param {string} endpoint - Base endpoint
   * @param {string} version - API version
   * @returns {string} Versioned endpoint
   */
  createVersionedEndpoint(endpoint, version = null) {
    const apiVersion = version || this.currentVersion;
    return `/api/${apiVersion}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  /**
   * Parse version from request
   * @param {object} request - HTTP request object
   * @returns {string|null} Parsed version
   */
  parseVersionFromRequest(request) {
    // Check header first
    if (request.headers && request.headers['api-version']) {
      return request.headers['api-version'];
    }

    // Check URL path
    const pathMatch = request.url?.match(/\/api\/(v\d+)\//);
    if (pathMatch) {
      return pathMatch[1];
    }

    // Check query parameter
    if (request.query && request.query.version) {
      return request.query.version;
    }

    return null;
  }

  /**
   * Handle versioned API request
   * @param {object} request - HTTP request object
   * @param {object} response - HTTP response object
   * @param {function} next - Next middleware function
   */
  handleVersionedRequest(request, response, next) {
    const requestedVersion = this.parseVersionFromRequest(request);
    const validation = this.validateVersion(requestedVersion);

    // Add version info to request
    request.apiVersion = {
      requested: requestedVersion,
      current: this.currentVersion,
      validation
    };

    // Add version headers to response
    const headers = this.getVersionHeaders();
    Object.keys(headers).forEach(key => {
      response.setHeader(key, headers[key]);
    });

    if (!validation.valid) {
      response.status(400).json({
        error: 'Invalid API version',
        message: validation.message,
        recommendations: validation.recommendations,
        supportedVersions: this.supportedVersions,
        currentVersion: this.currentVersion
      });
      return;
    }

    if (validation.deprecated) {
      response.setHeader('Warning', `Version ${requestedVersion} is deprecated. Please migrate to ${this.currentVersion}`);
    }

    next();
  }

  /**
   * Get version statistics
   * @returns {object} Version statistics
   */
  getVersionStats() {
    return {
      totalVersions: this.supportedVersions.length + this.deprecatedVersions.length,
      supportedVersions: this.supportedVersions.length,
      deprecatedVersions: this.deprecatedVersions.length,
      currentVersion: this.currentVersion,
      oldestSupportedVersion: this.supportedVersions[0] || null,
      newestVersion: this.currentVersion
    };
  }
}

// Create singleton instance
const apiVersioningService = new ApiVersioningService();

export default apiVersioningService;




