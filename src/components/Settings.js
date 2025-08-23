import React, { useState, useEffect } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDevTools } from '../contexts/DevToolsContext';
import toast from 'react-hot-toast';
import ThemeSettings from './ThemeSettings';

export default function Settings() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const { isDevMode, toggleDevMode, showDevTools, toggleDevTools } = useDevTools();
  const [activeTab, setActiveTab] = useState('profile');

  // Debug logging
  console.log('🔧 Settings DevTools state:', { isDevMode, showDevTools });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    displayName: userProfile?.displayName || '',
    email: currentUser?.email || '',
    photoURL: userProfile?.photoURL || '',
    phone: userProfile?.phone || '',
    timezone: userProfile?.timezone || 'UTC',
    language: userProfile?.language || 'en'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inventoryAlerts: true,
    spendingAlerts: true,
    collaborationUpdates: true,
    weeklyReports: false,
    monthlyReports: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'household',
    dataSharing: 'limited',
    analyticsTracking: true,
    thirdPartyIntegrations: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Validation states
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Check if any form has been modified
    const hasChanges = 
      profileForm.displayName !== (userProfile?.displayName || '') ||
      profileForm.phone !== (userProfile?.phone || '') ||
      profileForm.timezone !== (userProfile?.timezone || 'UTC') ||
      profileForm.language !== (userProfile?.language || 'en');
    
    setIsDirty(hasChanges);
  }, [profileForm, userProfile]);

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleNotificationChange = (field) => {
    setNotificationSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileForm.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    if (profileForm.phone && !/^\+?[\d\s\-\(\)]+$/.test(profileForm.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfileForm()) return;
    
    setIsLoading(true);
    try {
      await updateUserProfile(profileForm);
      toast.success('Profile updated successfully!');
      setIsDirty(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    try {
      // In a real app, you would call the password update function
      toast.success('Password updated successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to update password');
      console.error('Password update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = () => {
    // Simulate data export
    const exportData = {
      profile: profileForm,
      settings: {
        notifications: notificationSettings,
        privacy: privacySettings
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-hub-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Settings exported successfully!');
  };

  const handleDataImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            // In a real app, you would validate and apply the imported settings
            toast.success('Settings imported successfully!');
          } catch (error) {
            toast.error('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleAccountDeletion = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, you would call the account deletion function
      toast.success('Account deletion request submitted');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Theme', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'data', label: 'Data Management', icon: Download },
    { id: 'devtools', label: 'Developer Tools', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and privacy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                  {isDirty && (
                    <span className="text-sm text-blue-600 dark:text-blue-400">You have unsaved changes</span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Profile Photo */}
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profileForm.photoURL ? (
                        <img src={profileForm.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Change Photo
                      </button>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF up to 5MB</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={profileForm.displayName}
                        onChange={(e) => handleProfileChange('displayName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.displayName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter your display name"
                      />
                      {errors.displayName && (
                        <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profileForm.timezone}
                        onChange={(e) => handleProfileChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={profileForm.language}
                        onChange={(e) => handleProfileChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleProfileSave}
                      disabled={!isDirty || isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.newPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password"
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handlePasswordSave}
                      disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || isLoading}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            {activeTab === 'theme' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <ThemeSettings />
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {key.includes('Alerts') ? 'Get notified about important updates' :
                             key.includes('Reports') ? 'Receive periodic summaries' :
                             key.includes('Notifications') ? 'General app notifications' : 'System updates'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationChange(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Settings */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'public', label: 'Public', description: 'Anyone can see your profile' },
                        { value: 'household', label: 'Household Only', description: 'Only household members can see your profile' },
                        { value: 'private', label: 'Private', description: 'Only you can see your profile' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={option.value}
                            checked={privacySettings.profileVisibility === option.value}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sharing</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'full', label: 'Full Sharing', description: 'Share all data with household members' },
                        { value: 'limited', label: 'Limited Sharing', description: 'Share only essential data' },
                        { value: 'none', label: 'No Sharing', description: 'Keep all data private' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="dataSharing"
                            value={option.value}
                            checked={privacySettings.dataSharing === option.value}
                            onChange={(e) => handlePrivacyChange('dataSharing', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-medium text-gray-900">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Analytics Tracking</h3>
                        <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('analyticsTracking', !privacySettings.analyticsTracking)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacySettings.analyticsTracking ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacySettings.analyticsTracking ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Third-party Integrations</h3>
                        <p className="text-sm text-gray-500">Allow connections to external services</p>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange('thirdPartyIntegrations', !privacySettings.thirdPartyIntegrations)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          privacySettings.thirdPartyIntegrations ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            privacySettings.thirdPartyIntegrations ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
                
                <div className="space-y-6">
                  {/* Export Data */}
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Download className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">Export Your Data</h3>
                        <p className="text-gray-600 mb-4">
                          Download a copy of your data including profile, settings, and preferences.
                        </p>
                        <button
                          onClick={handleDataExport}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Import Data */}
                  <div className="p-6 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">Import Data</h3>
                        <p className="text-gray-600 mb-4">
                          Import previously exported data to restore your settings.
                        </p>
                        <button
                          onClick={handleDataImport}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Import Data</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                        <p className="text-red-700 mb-4">
                          This action will permanently delete your account and all associated data.
                          This action cannot be undone.
                        </p>
                        <button
                          onClick={handleAccountDeletion}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Developer Tools */}
            {activeTab === 'devtools' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Developer Tools</h2>

                <div className="space-y-6">
                  {/* Dev Mode Toggle */}
                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Developer Mode</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Enable advanced debugging tools and development features. Only enable if you're a developer or need to troubleshoot issues.
                        </p>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={toggleDevMode}
                            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${isDevMode
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                          >
                            <SettingsIcon className="w-4 h-4" />
                            <span>{isDevMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}</span>
                          </button>
                          {isDevMode && (
                            <button
                              onClick={toggleDevTools}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${showDevTools
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-green-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                              <SettingsIcon className="w-4 h-4" />
                              <span>{showDevTools ? 'Hide Dev Tools' : 'Show Dev Tools'}</span>
                            </button>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isDevMode ? 'Dev mode is active' : 'Click to enable debugging tools'}
                          </span>
                        </div>

                        {/* Debug Info */}
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded border text-xs">
                          <p><strong>Debug Info:</strong></p>
                          <p>isDevMode: {isDevMode ? '✅ true' : '❌ false'}</p>
                          <p>showDevTools: {showDevTools ? '✅ true' : '❌ false'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Debug Tools */}
                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Debug Tools</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Access debugging tools, performance metrics, and development utilities.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">State Debug</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Monitor component state changes</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Performance Metrics</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Track memory usage and render times</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Network Logs</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Monitor API calls and responses</p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Instance Tracking</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Prevent component duplication</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Useful development shortcuts and utilities.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => window.location.reload()}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Reload Page
                          </button>
                          <button
                            onClick={() => localStorage.clear()}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Clear Storage
                          </button>
                          <button
                            onClick={() => console.clear()}
                            className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            Clear Console
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
