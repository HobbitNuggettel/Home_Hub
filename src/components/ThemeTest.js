import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeTest = () => {
  const { isDarkMode, toggleDarkMode, theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Theme Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Light Mode Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Light Mode Card</h2>
            <p className="text-gray-600 mb-4">
              This card should always appear in light mode regardless of the current theme.
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-800">Light background content</p>
            </div>
          </div>

          {/* Dark Mode Card */}
          <div className="bg-gray-800 dark:bg-gray-700 border-2 border-gray-600 dark:border-gray-500 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4">Dark Mode Card</h2>
            <p className="text-gray-300 mb-4">
              This card should change appearance based on the current theme.
            </p>
            <div className="bg-gray-700 dark:bg-gray-600 p-4 rounded">
              <p className="text-gray-200">Dark background content</p>
            </div>
          </div>
        </div>

        {/* Theme Controls */}
        <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Theme Controls</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Current Theme:</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {theme}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="font-medium">Dark Mode:</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                {isDarkMode ? 'ON' : 'OFF'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="font-medium">Document Class:</span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                {document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              </span>
            </div>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Toggle Dark Mode
          </button>
        </div>

        {/* CSS Class Test */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">CSS Class Test</h3>
          <p className="text-gray-600 dark:text-gray-300">
            This section tests if the dark mode CSS classes are working properly.
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-gray-700 dark:text-gray-200">
              Nested content with dark mode styling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;
