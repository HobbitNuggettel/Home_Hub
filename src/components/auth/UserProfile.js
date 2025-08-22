import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Settings, Save, Edit, LogOut, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { currentUser, userProfile, updateUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });

  useEffect(() => {
    if (currentUser && userProfile) {
      setFormData({
        displayName: userProfile.displayName || currentUser.displayName || '',
        email: currentUser.email || '',
        photoURL: userProfile.photoURL || currentUser.photoURL || ''
      });
    }
  }, [currentUser, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    
    try {
      setLoading(true);
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        photoURL: formData.photoURL.trim() || null
      });
      
      toast.success('Profile updated successfully! 🎉');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">User Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center">
                  {formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {isEditing ? formData.displayName : (userProfile?.displayName || currentUser.displayName || 'User')}
                </h2>
                <p className="text-blue-100">
                  {currentUser.email}
                </p>
                {userProfile?.createdAt && (
                  <p className="text-blue-100 text-sm mt-1">
                    Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your display name"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  {/* Photo URL */}
                  <div className="md:col-span-2">
                    <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Photo URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Camera className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="photoURL"
                        name="photoURL"
                        type="url"
                        value={formData.photoURL}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a URL for your profile picture
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Display Name</p>
                        <p className="text-gray-900">
                          {userProfile?.displayName || currentUser.displayName || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email Address</p>
                        <p className="text-gray-900">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Member Since */}
                  {userProfile?.createdAt && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Member Since</p>
                          <p className="text-gray-900">
                            {new Date(userProfile.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Role */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Account Role</p>
                        <p className="text-gray-900 capitalize">
                          {userProfile?.role || 'User'}
                        </p>
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
