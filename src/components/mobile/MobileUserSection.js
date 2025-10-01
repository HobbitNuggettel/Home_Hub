import React from 'react';
import { User } from 'lucide-react';

/**
 * Mobile User Section Component
 * User profile display and authentication buttons
 */
const MobileUserSection = ({ userProfile, notifications, onLogin, onSignup }) => {
  if (userProfile) {
    return (
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="text-blue-600 dark:text-blue-400" size={24} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              {userProfile.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{userProfile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full capitalize">
                {userProfile.role || 'user'}
              </span>
              {notifications.length > 0 && (
                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
                  {notifications.length} notifications
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Not signed in</p>
        <div className="space-x-2">
          <button
            onClick={onLogin}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            Login
          </button>
          <button
            onClick={onSignup}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileUserSection;



