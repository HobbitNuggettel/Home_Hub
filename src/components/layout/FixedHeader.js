import React from 'react';
import { Menu, Sun, Moon, LogIn, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const FixedHeader = ({ onMenuToggle, isMenuOpen }) => {
  const { currentUser } = useAuth();
  const { isDarkMode, toggleDarkMode, themeMode } = useTheme();

  const handleThemeToggle = () => {
    console.log('Theme toggle clicked!', { isDarkMode, themeMode });
    console.log('Before toggle - isDarkMode:', isDarkMode, 'themeMode:', themeMode);
    toggleDarkMode();
    console.log('After toggle - isDarkMode:', isDarkMode, 'themeMode:', themeMode);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blue-600 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu toggle and Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">🏠</span>
            </div>
            <h1 className="text-white font-bold text-lg">Home Hub</h1>
          </div>
        </div>

        {/* Right side - Theme toggle and User actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2 bg-blue-700 rounded-lg p-1">
            <Sun 
              size={16} 
              className={`transition-colors duration-200 ${
                !isDarkMode ? 'text-yellow-400' : 'text-white'
              }`} 
            />
            
            <button
              onClick={handleThemeToggle}
              className={`w-8 h-4 rounded-full relative focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-600' : 'bg-blue-500'
              }`}
              aria-label="Toggle dark mode"
            >
              <div 
                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            
            <Moon 
              size={16} 
              className={`transition-colors duration-200 ${
                isDarkMode ? 'text-blue-200' : 'text-white'
              }`} 
            />
          </div>

          {/* User Actions */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-white text-sm font-medium">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>
          ) : (
            <button className="flex items-center space-x-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              <LogIn size={16} />
              <span>Login / Sign up</span>
              <span className="text-xs">→</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
