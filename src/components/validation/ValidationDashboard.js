/**
 * Validation Dashboard Component
 * Provides overview of validation system and testing tools
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Download,
  Settings,
  Code,
  TestTube,
  FileText,
  Database
} from 'lucide-react';
import { useValidationContext } from '../../contexts/ValidationContext';

const ValidationDashboard = () => {
  const {
    globalValidationState,
    formStates,
    fieldStates,
    getValidationStats,
    getFieldsWithErrors,
    getFieldsWithWarnings,
    getInvalidFields,
    validationService
  } = useValidationContext();

  const [stats, setStats] = useState(null);
  const [testData, setTestData] = useState({
    user: {
      email: 'test@example.com',
      password: 'TestPassword123!',
      displayName: 'Test User'
    },
    inventoryItem: {
      name: 'Test Item',
      category: 'Electronics',
      quantity: 5,
      price: 99.99
    }
  });
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Load validation statistics
  useEffect(() => {
    const loadStats = () => {
      try {
        const validationStats = getValidationStats();
        setStats(validationStats);
      } catch (error) {
        console.error('Failed to load validation stats:', error);
      }
    };

    loadStats();
  }, [getValidationStats]);

  // Test validation schemas
  const testValidation = async (schemaName, data) => {
    setIsLoading(true);
    try {
      const result = validationService.validate(schemaName, data);
      setTestResults(prev => ({
        ...prev,
        [schemaName]: result
      }));
    } catch (error) {
      console.error(`Validation test failed for ${schemaName}:`, error);
      setTestResults(prev => ({
        ...prev,
        [schemaName]: {
          isValid: false,
          errors: [{ field: 'test', message: error.message, type: 'test_error' }],
          warnings: []
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Test all schemas
  const testAllSchemas = async () => {
    const schemas = validationService.getAvailableSchemas();
    for (const schema of schemas) {
      if (testData[schema]) {
        await testValidation(schema, testData[schema]);
      }
    }
  };

  // Get validation status color
  const getStatusColor = (isValid) => {
    return isValid ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
  };

  // Get validation status icon
  const getStatusIcon = (isValid) => {
    return isValid ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
  };

  if (!stats) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Validation Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Data validation, sanitization, and testing tools
              </p>
            </div>
            <button
              onClick={testAllSchemas}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test All Schemas'}
            </button>
          </div>
        </div>

        {/* Global Validation Status */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Global Validation Status
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {globalValidationState.isValid ? 'Valid' : 'Invalid'}
                </p>
                {globalValidationState.errors.length > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {globalValidationState.errors.length} error(s)
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(globalValidationState.isValid)}`}>
                  {getStatusIcon(globalValidationState.isValid)}
                  <span className="ml-1">{globalValidationState.isValid ? 'Valid' : 'Invalid'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Statistics */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Validation Statistics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Forms</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalForms}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fields</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFields}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Errors</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.totalErrors}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Warnings</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.totalWarnings}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Schemas */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Available Validation Schemas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {validationService.getAvailableSchemas().map((schema) => (
                <div key={schema} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {schema}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Validation schema
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testValidation(schema, testData[schema] || {})}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Test schema"
                      >
                        <TestTube className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        title="View schema"
                      >
                        <Code className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Test Results
              </h3>
              <div className="space-y-4">
                {Object.entries(testResults).map(([schema, result]) => (
                  <div key={schema} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {schema}
                      </h4>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.isValid)}`}>
                        {getStatusIcon(result.isValid)}
                        <span className="ml-1">{result.isValid ? 'Valid' : 'Invalid'}</span>
                      </div>
                    </div>
                    
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                          Errors:
                        </p>
                        <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={`error-${schema}-${error.field || 'unknown'}-${error.message?.slice(0, 20) || index}`} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{error.message}</span>
                          </li>
                        ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.warnings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                          Warnings:
                        </p>
                        <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
                        {result.warnings.map((warning, index) => (
                          <li key={`warning-${schema}-${warning.field || 'unknown'}-${warning.message?.slice(0, 20) || index}`} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{warning.message}</span>
                          </li>
                        ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Field States */}
        {Object.keys(fieldStates).length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Field States
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Errors
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Warnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Touched
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(fieldStates).map(([fieldId, state]) => (
                      <tr key={fieldId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {fieldId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(state.isValid)}`}>
                            {getStatusIcon(state.isValid)}
                            <span className="ml-1">{state.isValid ? 'Valid' : 'Invalid'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {state.errors?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {state.warnings?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {state.isTouched ? 'Yes' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Validation Tools */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Validation Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <Shield className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">Schema Editor</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Edit validation schemas</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <TestTube className="h-5 w-5 text-green-600 mr-3" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">Test Suite</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Run validation tests</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FileText className="h-5 w-5 text-purple-600 mr-3" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white">Documentation</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View validation docs</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationDashboard;
