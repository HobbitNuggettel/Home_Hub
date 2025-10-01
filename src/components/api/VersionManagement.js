/**
 * API Version Management Component
 * Provides UI for managing API versions and migration
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Download,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Code,
  BookOpen
} from 'lucide-react';
import useApiVersioning from '../../hooks/useApiVersioning';

const VersionManagement = () => {
  const {
    version,
    supportedVersions,
    versionInfo,
    isLoading,
    error,
    isDeprecated,
    migrationGuide,
    changeVersion,
    migrateToRecommended,
    loadVersionInfo,
    getVersionStats,
    getCompatibilityMatrix,
    getMigrationGuide
  } = useApiVersioning();

  const [stats, setStats] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(version);
  const [showMigrationGuide, setShowMigrationGuide] = useState(false);
  const [targetMigrationVersion, setTargetMigrationVersion] = useState('');

  // Load additional data
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        const [statsData, compatibilityData] = await Promise.all([
          getVersionStats(),
          getCompatibilityMatrix()
        ]);
        setStats(statsData);
        setCompatibility(compatibilityData);
      } catch (err) {
        console.error('Failed to load additional data:', err);
      }
    };

    if (versionInfo) {
      loadAdditionalData();
    }
  }, [versionInfo, getVersionStats, getCompatibilityMatrix]);

  // Handle version change
  const handleVersionChange = (newVersion) => {
    if (newVersion !== version) {
      changeVersion(newVersion);
      setSelectedVersion(newVersion);
    }
  };

  // Handle migration
  const handleMigration = () => {
    migrateToRecommended();
    setSelectedVersion(version);
  };

  // Load migration guide
  const handleLoadMigrationGuide = async (targetVersion) => {
    try {
      setTargetMigrationVersion(targetVersion);
      setShowMigrationGuide(true);
    } catch (err) {
      console.error('Failed to load migration guide:', err);
    }
  };

  // Get version status color
  const getVersionStatusColor = (versionStatus) => {
    switch (versionStatus) {
      case 'current': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'deprecated': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'unsupported': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get version status icon
  const getVersionStatusIcon = (versionStatus) => {
    switch (versionStatus) {
      case 'current': return <CheckCircle className="h-4 w-4" />;
      case 'deprecated': return <AlertTriangle className="h-4 w-4" />;
      case 'unsupported': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error Loading Version Information
              </h3>
            </div>
            <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={loadVersionInfo}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Version Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage API versions, migration, and compatibility
              </p>
            </div>
            <button
              onClick={loadVersionInfo}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Current Version Status */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Current API Version
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {version}
                </p>
                {isDeprecated && (
                  <div className="mt-2 flex items-center text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span className="text-sm">This version is deprecated</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVersionStatusColor(isDeprecated ? 'deprecated' : 'current')}`}>
                  {getVersionStatusIcon(isDeprecated ? 'deprecated' : 'current')}
                  <span className="ml-1">{isDeprecated ? 'Deprecated' : 'Current'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Version Selection */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Select API Version
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedVersions.map((versionOption) => (
                <div
                  key={versionOption}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedVersion === versionOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedVersion(versionOption)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedVersion(versionOption);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Version {versionOption}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {versionOption === version ? 'Currently active' : 'Available'}
                      </p>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVersionStatusColor(versionOption === version ? 'current' : 'supported')}`}>
                      {getVersionStatusIcon(versionOption === version ? 'current' : 'supported')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleVersionChange(selectedVersion)}
                disabled={selectedVersion === version}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Switch to {selectedVersion}
              </button>
              {isDeprecated && (
                <button
                  onClick={handleMigration}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Migrate to Recommended
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Version Information */}
        {versionInfo && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Version Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Version</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {versionInfo.current}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supported Versions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {versionInfo.supported.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deprecated Versions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {versionInfo.deprecated.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Versions</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {versionInfo.supported.length + versionInfo.deprecated.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {stats && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Version Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Versions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalVersions}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supported Versions</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.supportedVersions}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deprecated Versions</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.deprecatedVersions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compatibility Matrix */}
        {compatibility && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Version Compatibility
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Features
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(compatibility).map(([versionKey, info]) => (
                      <tr key={versionKey}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {versionKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVersionStatusColor(info.status)}`}>
                            {getVersionStatusIcon(info.status)}
                            <span className="ml-1 capitalize">{info.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {info.features?.length || 0} features
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleLoadMigrationGuide(versionKey)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View migration guide"
                            >
                              <BookOpen className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleVersionChange(versionKey)}
                              disabled={versionKey === version}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                              title="Switch to this version"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Migration Guide Modal */}
        {showMigrationGuide && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Migration Guide: {targetMigrationVersion}
                  </h3>
                  <button
                    onClick={() => setShowMigrationGuide(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  <p>Migration guide for version {targetMigrationVersion} will be loaded here.</p>
                  <p className="mt-2">This would include step-by-step instructions for migrating from the current version to the target version.</p>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMigrationGuide(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleVersionChange(targetMigrationVersion)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Migrate Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionManagement;
