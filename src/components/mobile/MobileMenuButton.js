import React from 'react';
import { Menu } from 'lucide-react';

/**
 * Mobile Menu Button Component
 * Enhanced hamburger menu button with touch optimization
 */
const MobileMenuButton = ({ onClick, isOpen, apiStatus }) => {
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
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-[9999] p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-lg mobile-nav-button group min-h-[44px] min-w-[44px] touch-manipulation"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <Menu size={24} className="group-hover:scale-110 transition-transform" />
      
      {/* API Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {getApiStatusIndicator()}
      </div>
    </button>
  );
};

export default MobileMenuButton;



