/**
 * Language Selector Component
 * Allows users to switch between different languages
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = ({ 
  variant = 'dropdown',
  showFlag = true,
  showName = true,
  className = ''
}) => {
  const {
    currentLanguage,
    isLoading,
    availableLanguages,
    changeLanguage,
    getCurrentLanguageInfo,
    getLanguageName,
    getLanguageFlag
  } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const currentLangInfo = getCurrentLanguageInfo();

  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
    setIsOpen(false);
  };

  const handleKeyDown = (e, languageCode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLanguageChange(languageCode);
    }
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          `}
          aria-label="Select language"
        >
          {showFlag && <span className="text-lg">{getLanguageFlag(currentLanguage)}</span>}
          {showName && <span className="text-sm font-medium">{getLanguageName(currentLanguage)}</span>}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  onKeyDown={(e) => handleKeyDown(e, language.code)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-2 text-left text-sm
                    hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                    ${currentLanguage === language.code ? 'bg-blue-50 dark:bg-blue-900' : ''}
                    transition-colors
                  `}
                  role="menuitem"
                  tabIndex={0}
                >
                  {showFlag && <span className="text-lg">{language.flag}</span>}
                  <span className="flex-1 font-medium text-gray-900 dark:text-white">
                    {language.name}
                  </span>
                  {currentLanguage === language.code && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Overlay to close dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            onKeyDown={(e) => handleKeyDown(e, language.code)}
            disabled={isLoading}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg border transition-colors
              ${currentLanguage === language.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            role="menuitem"
            tabIndex={0}
          >
            {showFlag && <span className="text-xl">{language.flag}</span>}
            <div className="flex-1 text-left">
              <div className="font-medium">{language.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {language.code.toUpperCase()}
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'tabs') {
    return (
      <div className={`flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            onKeyDown={(e) => handleKeyDown(e, language.code)}
            disabled={isLoading}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${currentLanguage === language.code
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            role="tab"
            tabIndex={0}
          >
            {showFlag && <span className="text-sm">{language.flag}</span>}
            {showName && <span>{language.name}</span>}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

LanguageSelector.propTypes = {
  variant: PropTypes.oneOf(['dropdown', 'list', 'tabs']),
  showFlag: PropTypes.bool,
  showName: PropTypes.bool,
  className: PropTypes.string
};

export default LanguageSelector;




