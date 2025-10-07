import React from 'react';
import PropTypes from 'prop-types';
import ThemeToggleButton from '../common/ThemeToggleButton';

const Header = ({ title, subtitle, showThemeToggle = true }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {title && (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            )}
          </div>
          
          {showThemeToggle && (
            <div className="flex items-center space-x-2">
              <ThemeToggleButton 
                variant="header" 
                showLabel={true}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  showThemeToggle: PropTypes.bool
};

export default Header;
