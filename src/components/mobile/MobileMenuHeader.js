import React from 'react';
import { X, Home } from 'lucide-react';

/**
 * Mobile Menu Header Component
 * Header section with app branding and close button
 */
const MobileMenuHeader = ({ onClose, apiStatus }) => {
  const getApiStatusIndicator = () => {
    switch (apiStatus) {
      case 'online':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'offline':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Home className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Home Hub</h1>
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <span>Mobile Navigation</span>
            {getApiStatusIndicator()}
            <span className="text-xs">{apiStatus}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
        aria-label="Close menu"
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default MobileMenuHeader;
