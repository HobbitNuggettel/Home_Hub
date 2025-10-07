import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.js';

const DarkModeToggle = ({ className = '', showLabel = false }) => {
  const { isDarkMode, toggleDarkMode, themeMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        isDarkMode
        ? 'bg-blue-800 text-yellow-400 hover:bg-blue-700'
        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      } ${className}`}
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

DarkModeToggle.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool
};

export default DarkModeToggle;
