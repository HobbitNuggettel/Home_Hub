/**
 * React Hook for API Versioning
 * Provides easy access to API versioning functionality in React components
 */

import { useState, useEffect, useCallback } from 'react';
import versionedApiClient from '../services/VersionedApiClient';
import loggingService from '../services/LoggingService';

const useApiVersioning = () => {
  const [version, setVersion] = useState(versionedApiClient.getVersion());
  const [supportedVersions, setSupportedVersions] = useState(versionedApiClient.getSupportedVersions());
  const [versionInfo, setVersionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeprecated, setIsDeprecated] = useState(false);
  const [migrationGuide, setMigrationGuide] = useState(null);

  // Load version information
  const loadVersionInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const info = await versionedApiClient.getVersionInfo();
      setVersionInfo(info);
      setSupportedVersions(info.supported);
      setVersion(info.current);
      
      // Check if current version is deprecated
      const deprecated = info.deprecated.includes(info.current);
      setIsDeprecated(deprecated);

      // Load migration guide if deprecated
      if (deprecated) {
        try {
          const guide = await versionedApiClient.getMigrationGuide(info.current);
          setMigrationGuide(guide);
        } catch (guideError) {
          loggingService.warn('Failed to load migration guide', { error: guideError.message });
        }
      }

      loggingService.info('Version info loaded successfully', { info });
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to load version info', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change API version
  const changeVersion = useCallback((newVersion) => {
    try {
      versionedApiClient.setVersion(newVersion);
      setVersion(newVersion);
      setIsDeprecated(false);
      setMigrationGuide(null);
      loggingService.info(`API version changed to ${newVersion}`);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to change API version', { error: err.message });
    }
  }, []);

  // Migrate to recommended version
  const migrateToRecommended = useCallback(() => {
    try {
      versionedApiClient.migrateToRecommendedVersion();
      const recommended = versionedApiClient.getRecommendedVersion();
      setVersion(recommended);
      setIsDeprecated(false);
      setMigrationGuide(null);
      loggingService.info(`Migrated to recommended version: ${recommended}`);
    } catch (err) {
      setError(err.message);
      loggingService.error('Failed to migrate to recommended version', { error: err.message });
    }
  }, []);

  // Get version statistics
  const getVersionStats = useCallback(async () => {
    try {
      const stats = await versionedApiClient.getVersionStats();
      return stats;
    } catch (err) {
      loggingService.error('Failed to get version stats', { error: err.message });
      throw err;
    }
  }, []);

  // Get compatibility matrix
  const getCompatibilityMatrix = useCallback(async () => {
    try {
      const matrix = await versionedApiClient.getCompatibilityMatrix();
      return matrix;
    } catch (err) {
      loggingService.error('Failed to get compatibility matrix', { error: err.message });
      throw err;
    }
  }, []);

  // Get migration guide for specific version
  const getMigrationGuide = useCallback(async (targetVersion) => {
    try {
      const guide = await versionedApiClient.getMigrationGuide(targetVersion);
      return guide;
    } catch (err) {
      loggingService.error('Failed to get migration guide', { version: targetVersion, error: err.message });
      throw err;
    }
  }, []);

  // Check if version is supported
  const isVersionSupported = useCallback((checkVersion) => {
    return supportedVersions.includes(checkVersion);
  }, [supportedVersions]);

  // Get versioned API client
  const getApiClient = useCallback(() => {
    return versionedApiClient;
  }, []);

  // Make versioned API request
  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await versionedApiClient.request(endpoint, options);
      return response;
    } catch (err) {
      loggingService.error('API request failed', { endpoint, error: err.message });
      throw err;
    }
  }, []);

  // Load version info on mount
  useEffect(() => {
    loadVersionInfo();
  }, [loadVersionInfo]);

  // Auto-migrate if deprecated
  useEffect(() => {
    if (isDeprecated && versionedApiClient.isCurrentVersionDeprecated()) {
      const recommended = versionedApiClient.getRecommendedVersion();
      if (recommended !== version) {
        loggingService.warn(`Current version ${version} is deprecated, migrating to ${recommended}`);
        migrateToRecommended();
      }
    }
  }, [isDeprecated, version, migrateToRecommended]);

  return {
    // State
    version,
    supportedVersions,
    versionInfo,
    isLoading,
    error,
    isDeprecated,
    migrationGuide,

    // Actions
    changeVersion,
    migrateToRecommended,
    loadVersionInfo,
    getVersionStats,
    getCompatibilityMatrix,
    getMigrationGuide,
    isVersionSupported,
    getApiClient,
    makeRequest,

    // Convenience methods
    get: (endpoint, options) => versionedApiClient.get(endpoint, options),
    post: (endpoint, data, options) => versionedApiClient.post(endpoint, data, options),
    put: (endpoint, data, options) => versionedApiClient.put(endpoint, data, options),
    patch: (endpoint, data, options) => versionedApiClient.patch(endpoint, data, options),
    delete: (endpoint, options) => versionedApiClient.delete(endpoint, options)
  };
};

export default useApiVersioning;
