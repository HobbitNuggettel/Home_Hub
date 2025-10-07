import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.js';

const ThemeDebug = () => {
  const { isDarkMode, theme } = useTheme();

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Theme Debug</h3>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Dark Mode: {isDarkMode ? 'ON' : 'OFF'}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Theme: {theme}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300">
        Document Class: {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
      </p>
    </div>
  );
};

export default ThemeDebug;
