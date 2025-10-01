import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeTest = () => {
  const { isDarkMode, themeMode, toggleDarkMode } = useTheme();

  const handleToggle = () => {
    console.log('ThemeTest toggle clicked!', { isDarkMode, themeMode });
    toggleDarkMode();
  };

  return (
    <div className="p-4 bg-yellow-100 border-2 border-yellow-500 rounded-lg m-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">🎨 Theme Toggle Test</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Current Mode:</strong> {themeMode}</p>
        <p><strong>Is Dark Mode:</strong> {isDarkMode ? 'Yes' : 'No'}</p>
        <p><strong>Body Classes:</strong> {document.body.className}</p>
        <p><strong>HTML Classes:</strong> {document.documentElement.className}</p>
        <button
          onClick={handleToggle}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Toggle Theme (Check Console)
        </button>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <p>Click the toggle button above or the one in the header to test theme switching.</p>
          <p>Check browser console for debug logs.</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeTest;