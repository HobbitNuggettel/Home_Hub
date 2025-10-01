/**
 * Enterprise Dashboard Component
 * Comprehensive enterprise features management
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  Download, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Lock,
  Eye,
  UserCheck,
  FileCheck,
  Globe,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ssoService from '../../services/SSOService';
import rbacService from '../../services/RBACService';
import auditLoggingService from '../../services/AuditLoggingService';
import complianceReportingService from '../../services/ComplianceReportingService';

const EnterpriseDashboard = () => {
  const { currentUser } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [ssoConfig, setSsoConfig] = useState(null);
  const [rbacData, setRbacData] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);

  // Load enterprise data
  useEffect(() => {
    loadEnterpriseData();
  }, []);

  const loadEnterpriseData = async () => {
    setIsLoading(true);
    try {
      // Load SSO configuration
      const sso = ssoService.getSSOConfig();
      setSsoConfig(sso);

      // Load RBAC data
      const roles = rbacService.getRoles();
      const permissions = rbacService.getPermissions();
      setRbacData({ roles, permissions });

      // Load audit data
      const auditLogs = await auditLoggingService.getAuditLogs({ limit: 100 });
      const auditStats = await auditLoggingService.getAuditStatistics({ limit: 1000 });
      setAuditData({ logs: auditLogs, stats: auditStats });

      // Load compliance data
      const standards = complianceReportingService.getSupportedStandards();
      setComplianceData({ standards });
    } catch (error) {
      console.error('Failed to load enterprise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOSignIn = async (provider) => {
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await ssoService.signInWithGoogle();
          break;
        case 'microsoft':
          result = await ssoService.signInWithMicrosoft();
          break;
        case 'apple':
          result = await ssoService.signInWithApple();
          break;
        case 'github':
          result = await ssoService.signInWithGitHub();
          break;
        case 'linkedin':
          result = await ssoService.signInWithLinkedIn();
          break;
        default:
          throw new Error('Unsupported provider');
      }

      if (result.success) {
        alert(`Successfully signed in with ${provider}`);
      } else {
        alert(`Failed to sign in with ${provider}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error signing in with ${provider}: ${error.message}`);
    }
  };

  const handleGenerateComplianceReport = async (standard) => {
    try {
      const result = await complianceReportingService.generateComplianceReport(standard);
      if (result.success) {
        alert(`Compliance report generated for ${standard}. Score: ${result.report.summary.complianceScore}%`);
      } else {
        alert(`Failed to generate compliance report: ${result.error}`);
      }
    } catch (error) {
      alert(`Error generating compliance report: ${error.message}`);
    }
  };

  const handleExportAuditLogs = async () => {
    try {
      const result = await auditLoggingService.exportAuditLogs({}, 'csv');
      if (result.success) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert(`Failed to export audit logs: ${result.error}`);
      }
    } catch (error) {
      alert(`Error exporting audit logs: ${error.message}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to view the enterprise dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enterprise Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive enterprise features and compliance management
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'sso', name: 'SSO', icon: Globe },
              { id: 'rbac', name: 'RBAC', icon: Users },
              { id: 'audit', name: 'Audit Logs', icon: FileText },
              { id: 'compliance', name: 'Compliance', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading enterprise data...</p>
          </div>
        )}

        {/* Overview Tab */}
        {selectedTab === 'overview' && !isLoading && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SSO Providers</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {ssoConfig?.providers?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Roles</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {rbacData?.roles?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Audit Events</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {auditData?.stats?.statistics?.totalEvents || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Compliance Standards</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {complianceData?.standards?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {auditData?.logs?.logs?.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {log.severity === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : log.severity === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {log.action} - {log.resource}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {log.userEmail} • {new Date(log.timestamp.toDate()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SSO Tab */}
        {selectedTab === 'sso' && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SSO Providers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ssoConfig?.providers?.map((provider) => (
                  <div key={provider.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-2xl">{provider.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{provider.displayName}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {provider.enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSSOSignIn(provider.name)}
                      disabled={!provider.enabled}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Sign In with {provider.displayName}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RBAC Tab */}
        {selectedTab === 'rbac' && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Roles & Permissions</h3>
              <div className="space-y-4">
                {rbacData?.roles?.map((role) => (
                  <div key={role.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{role.name}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {role.permissions.length} permissions
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{role.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 5).map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{role.permissions.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Tab */}
        {selectedTab === 'audit' && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit Logs</h3>
                <button
                  onClick={handleExportAuditLogs}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditData?.logs?.logs?.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-shrink-0">
                      {log.severity === 'error' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : log.severity === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.resource}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.severity === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.userEmail} • {new Date(log.timestamp.toDate()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {selectedTab === 'compliance' && !isLoading && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compliance Standards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {complianceData?.standards?.map((standard) => (
                  <div key={standard.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">{standard.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{standard.description}</p>
                    <button
                      onClick={() => handleGenerateComplianceReport(standard.key)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
