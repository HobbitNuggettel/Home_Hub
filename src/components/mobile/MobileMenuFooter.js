import React from 'react';
import PropTypes from 'prop-types';
import { LogOut } from 'lucide-react';

/**
 * Mobile Menu Footer Component
 * Logout button and user actions
 */
const MobileMenuFooter = ({ userProfile, onLogout }) => {
  if (!userProfile) return null;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-lg min-h-[44px] touch-manipulation"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

MobileMenuFooter.propTypes = {
  userProfile: PropTypes.object,
  onLogout: PropTypes.func.isRequired
};

export default MobileMenuFooter;




