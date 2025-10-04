/**
 * Language Context
 * Provides language switching and translation functionality
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language || 'en');
  const [isLoading, setIsLoading] = useState(false);

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // Change language
  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return;

    setIsLoading(true);
    try {
      await i18nInstance.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      // Save to localStorage
      localStorage.setItem('i18nextLng', languageCode);
      
      // Update document language
      document.documentElement.lang = languageCode;
      
      // Update document direction for RTL languages
      if (['ar', 'he', 'fa'].includes(languageCode)) {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
      
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  // Get language name by code
  const getLanguageName = (code) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // Get language flag by code
  const getLanguageFlag = (code) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.flag : '🌐';
  };

  // Check if language is RTL
  const isRTL = (code = currentLanguage) => {
    return ['ar', 'he', 'fa'].includes(code);
  };

  // Get text direction
  const getTextDirection = (code = currentLanguage) => {
    return isRTL(code) ? 'rtl' : 'ltr';
  };

  // Format date according to locale
  const formatDate = (date, options = {}) => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
      }).format(new Date(date));
    } catch (error) {
      console.error('Failed to format date:', error);
      return date;
    }
  };

  // Format number according to locale
  const formatNumber = (number, options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(number);
    } catch (error) {
      console.error('Failed to format number:', error);
      return number;
    }
  };

  // Format currency according to locale
  const formatCurrency = (amount, currency = 'USD', options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency,
        ...options
      }).format(amount);
    } catch (error) {
      console.error('Failed to format currency:', error);
      return amount;
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
    
    // Set initial document language and direction
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = getTextDirection();
  }, []);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    i18nInstance.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  const value = {
    // Current state
    currentLanguage,
    isLoading,
    
    // Available languages
    availableLanguages,
    
    // Language functions
    changeLanguage,
    getCurrentLanguageInfo,
    getLanguageName,
    getLanguageFlag,
    isRTL,
    getTextDirection,
    
    // Formatting functions
    formatDate,
    formatNumber,
    formatCurrency
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default LanguageContext;




