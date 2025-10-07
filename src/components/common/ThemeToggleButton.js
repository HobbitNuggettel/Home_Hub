import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.js';

const ThemeToggleButton = ({ className = '', showLabel = false, variant = 'default' }) => {
  const { isDarkMode, toggleDarkMode, themeMode } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'floating':
        return `fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-200 ${
          isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`;
      case 'header':
        return `px-3 py-2 rounded-md transition-colors duration-200 ${
          isDarkMode
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`;
      default:
        return `p-2 rounded-lg transition-colors duration-200 ${
          isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`;
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`${getVariantStyles()} ${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

ThemeToggleButton.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'floating', 'header'])
};

export default ThemeToggleButton;
