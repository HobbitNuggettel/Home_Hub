import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { LoginForm, RegisterForm, UserProfile } from './AuthSystem.js';
import { PWAStatus, PWAFeatures } from './PWAInstall.js';
import { 
  Shield, 
  Smartphone, 
  Zap, 
  Users, 
  Database,
  Lock,
  Key,
  CheckCircle
} from 'lucide-react';

const AuthPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'profile'
  const [activeTab, setActiveTab] = useState('auth');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account & Security</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your Home Hub account and security settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Profile */}
            <div className="lg:col-span-2">
              <UserProfile />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PWAStatus />
              <PWAFeatures />
              
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    <Shield className="text-blue-500" size={16} />
                    <span>Security Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    <Users className="text-green-500" size={16} />
                    <span>Household Management</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                    <Database className="text-purple-500" size={16} />
                    <span>Data Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Authentication Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'auth'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Lock size={16} />
                    <span>Authentication</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'features'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap size={16} />
                    <span>PWA Features</span>
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'auth' ? (
                <div>
                  {authMode === 'login' ? (
                    <div>
                      <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
                    </div>
                  ) : (
                    <div>
                      <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <PWAStatus />
                  <PWAFeatures />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="text-blue-600" size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Home Hub</h2>
                <p className="text-gray-600 text-sm">
                  Your comprehensive home management solution with enterprise-grade security
                </p>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-lg shadow-md p-4 border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>JWT Token Authentication</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Role-Based Access Control</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Secure Password Management</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="text-green-500" size={16} />
                  <span>Two-Factor Authentication Ready</span>
                </div>
              </div>
            </div>

            {/* PWA Benefits */}
            <div className="bg-white rounded-lg shadow-md p-4 border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">PWA Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Smartphone className="text-blue-500" size={16} />
                  <span>Install on any device</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Zap className="text-green-500" size={16} />
                  <span>Offline functionality</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="text-purple-500" size={16} />
                  <span>Native app experience</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Key className="text-orange-500" size={16} />
                  <span>Automatic updates</span>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Demo Credentials</h3>
              <div className="space-y-1 text-xs text-yellow-700">
                <p><strong>Owner:</strong> john.smith@email.com</p>
                <p><strong>Admin:</strong> jane.smith@email.com</p>
                <p><strong>Password:</strong> password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 