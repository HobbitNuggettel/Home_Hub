import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Database, 
  Cloud, 
  HardDrive, 
  Settings, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import weatherStorageConfig from '../services/WeatherStorageConfig';

const WeatherStorageSettings = ({ onClose }) => {
  const [currentStorage, setCurrentStorage] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = () => {
    const storageInfo = weatherStorageConfig.getStorageInfo();
    const options = weatherStorageConfig.getAvailableStorageOptions();
    
    setCurrentStorage(storageInfo);
    setAvailableOptions(options);
  };

  const handleStorageChange = async (newStorageType) => {
    if (newStorageType === currentStorage.type) return;

    setIsMigrating(true);
    setMigrationStatus('Starting migration...');

    try {
      if (newStorageType === 'firebase') {
        setMigrationStatus('Migrating to Firebase...');
        await weatherStorageConfig.migrateToFirebase();
        setMigrationStatus('Migration to Firebase completed successfully!');
      } else {
        setMigrationStatus('Migrating to local storage...');
        await weatherStorageConfig.migrateToLocal();
        setMigrationStatus('Migration to local storage completed successfully!');
      }
      
      // Reload storage info
      loadStorageInfo();
      
      setTimeout(() => {
        setMigrationStatus(null);
        setIsMigrating(false);
      }, 3000);
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus(`Migration failed: ${error.message}`);
      setIsMigrating(false);
    }
  };

  const getStorageIcon = (type) => {
    switch (type) {
      case 'firebase':
        return <Cloud className="w-6 h-6 text-blue-500" />;
      case 'local':
        return <HardDrive className="w-6 h-6 text-green-500" />;
      default:
        return <Database className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Storage Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Storage Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              {getStorageIcon(currentStorage?.type)}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Storage: {currentStorage?.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {currentStorage?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentStorage?.features.map((feature, index) => (
                <span
                  key={`feature-${feature}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Storage Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Storage Options</h3>
            <div className="space-y-3">
              {availableOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    currentStorage?.type === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{option.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {currentStorage?.type === option.id && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {option.available ? (
                        <button
                          onClick={() => handleStorageChange(option.id)}
                          disabled={isMigrating || currentStorage?.type === option.id}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentStorage?.type === option.id
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isMigrating
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {currentStorage?.type === option.id ? 'Active' : 'Switch'}
                        </button>
                      ) : (
                        <span className="text-sm text-red-500">Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Migration Status */}
          {migrationStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              migrationStatus.includes('failed') 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center space-x-2">
                {migrationStatus.includes('failed') ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <RefreshCw className={`w-5 h-5 ${isMigrating ? 'animate-spin' : ''} text-green-500`} />
                )}
                <span className={`text-sm font-medium ${
                  migrationStatus.includes('failed') ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'
                }`}>
                  {migrationStatus}
                </span>
              </div>
            </div>
          )}

          {/* Storage Comparison */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Comparison</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Local Storage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Firebase</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Offline Access</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">✅ Yes</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">⚠️ Limited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Multi-Device Sync</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">❌ No</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">✅ Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Privacy</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">✅ High</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">⚠️ Medium</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Storage Limit</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">~10MB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Cost</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Free</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Free Tier Available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Data is automatically backed up and can be migrated between storage types.
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

WeatherStorageSettings.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default WeatherStorageSettings;


