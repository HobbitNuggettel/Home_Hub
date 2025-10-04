/**
 * API Versioning Middleware for Express
 * Handles API versioning, backward compatibility, and migration strategies
 */

const apiVersioningService = require('../services/ApiVersioningService').default;

/**
 * API Versioning Middleware
 * Validates API versions and adds version information to requests
 */
const apiVersioningMiddleware = (req, res, next) => {
  try {
    // Handle versioned request
    apiVersioningService.handleVersionedRequest(req, res, next);
  } catch (error) {
    console.error('API versioning middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process API versioning'
    });
  }
};

/**
 * Version-specific route handler
 * Creates versioned routes with backward compatibility
 */
const createVersionedRoute = (versions, handler) => {
  return (req, res, next) => {
    const requestedVersion = req.apiVersion?.requested || apiVersioningService.getCurrentVersion();
    
    // Check if version is supported
    if (!apiVersioningService.isVersionSupported(requestedVersion)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        message: `Version ${requestedVersion} is not supported`,
        supportedVersions: apiVersioningService.getSupportedVersions()
      });
    }

    // Get version-specific handler
    const versionHandler = versions[requestedVersion] || versions[apiVersioningService.getCurrentVersion()];
    
    if (!versionHandler) {
      return res.status(500).json({
        error: 'Handler not found',
        message: `No handler found for version ${requestedVersion}`
      });
    }

    // Execute version-specific handler
    try {
      versionHandler(req, res, next);
    } catch (error) {
      console.error(`Error in version ${requestedVersion} handler:`, error);
      res.status(500).json({
        error: 'Handler execution error',
        message: error.message
      });
    }
  };
};

/**
 * Backward compatibility middleware
 * Ensures backward compatibility for deprecated versions
 */
const backwardCompatibilityMiddleware = (req, res, next) => {
  const requestedVersion = req.apiVersion?.requested;
  
  if (!requestedVersion) {
    return next();
  }

  // Check if version is deprecated
  if (apiVersioningService.isVersionDeprecated(requestedVersion)) {
    const strategy = apiVersioningService.getVersionStrategy(requestedVersion);
    const migrationPath = apiVersioningService.getMigrationPath(requestedVersion);
    
    // Add deprecation warning
    res.setHeader('Warning', `Version ${requestedVersion} is deprecated. Please migrate to ${apiVersioningService.getCurrentVersion()}`);
    
    // Add migration information to response
    res.setHeader('API-Migration-Required', 'true');
    res.setHeader('API-Migration-Guide', migrationPath?.migrationGuide || '');
    
    // Log deprecation usage
    console.warn(`Deprecated API version used: ${requestedVersion}`, {
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      endpoint: req.path,
      method: req.method
    });
  }

  next();
};

/**
 * Version migration helper
 * Helps migrate data between API versions
 */
const versionMigrationHelper = {
  /**
   * Migrate request data to current version
   * @param {object} data - Request data
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {object} Migrated data
   */
  migrateRequestData(data, fromVersion, toVersion) {
    // This would contain actual migration logic
    // For now, return data as-is
    return data;
  },

  /**
   * Migrate response data from current version to requested version
   * @param {object} data - Response data
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {object} Migrated data
   */
  migrateResponseData(data, fromVersion, toVersion) {
    // This would contain actual migration logic
    // For now, return data as-is
    return data;
  },

  /**
   * Get migration rules for a version
   * @param {string} version - Version to get rules for
   * @returns {object} Migration rules
   */
  getMigrationRules(version) {
    const strategy = apiVersioningService.getVersionStrategy(version);
    return strategy?.migrationRules || {};
  }
};

/**
 * API version info endpoint
 * Provides information about available API versions
 */
const versionInfoEndpoint = (req, res) => {
  try {
    const versionInfo = apiVersioningService.getVersionInfo();
    res.json(versionInfo);
  } catch (error) {
    console.error('Error getting version info:', error);
    res.status(500).json({
      error: 'Failed to get version information',
      message: error.message
    });
  }
};

/**
 * API version statistics endpoint
 * Provides statistics about API version usage
 */
const versionStatsEndpoint = (req, res) => {
  try {
    const stats = apiVersioningService.getVersionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting version stats:', error);
    res.status(500).json({
      error: 'Failed to get version statistics',
      message: error.message
    });
  }
};

/**
 * API version compatibility endpoint
 * Provides compatibility matrix for all versions
 */
const versionCompatibilityEndpoint = (req, res) => {
  try {
    const compatibility = apiVersioningService.getCompatibilityMatrix();
    res.json(compatibility);
  } catch (error) {
    console.error('Error getting version compatibility:', error);
    res.status(500).json({
      error: 'Failed to get version compatibility',
      message: error.message
    });
  }
};

/**
 * API version migration guide endpoint
 * Provides migration guide for a specific version
 */
const versionMigrationGuideEndpoint = (req, res) => {
  try {
    const { version } = req.params;
    const migrationPath = apiVersioningService.getMigrationPath(version);
    
    if (!migrationPath) {
      return res.status(404).json({
        error: 'Migration guide not found',
        message: `No migration guide found for version ${version}`
      });
    }

    res.json(migrationPath);
  } catch (error) {
    console.error('Error getting migration guide:', error);
    res.status(500).json({
      error: 'Failed to get migration guide',
      message: error.message
    });
  }
};

module.exports = {
  apiVersioningMiddleware,
  createVersionedRoute,
  backwardCompatibilityMiddleware,
  versionMigrationHelper,
  versionInfoEndpoint,
  versionStatsEndpoint,
  versionCompatibilityEndpoint,
  versionMigrationGuideEndpoint
};




