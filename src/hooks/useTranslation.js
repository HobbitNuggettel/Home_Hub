/**
 * Enhanced Translation Hook
 * Provides additional translation utilities and formatting
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext.js';

export const useTranslation = (namespace = 'translation') => {
  const { t, i18n } = useI18nTranslation(namespace);
  const {
    currentLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    isRTL,
    getTextDirection
  } = useLanguage();

  // Enhanced translation function with interpolation
  const translate = (key, options = {}) => {
    try {
      return t(key, options);
    } catch (error) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  };

  // Translation with fallback
  const translateWithFallback = (key, fallback, options = {}) => {
    const translation = t(key, options);
    return translation === key ? fallback : translation;
  };

  // Plural translation
  const translatePlural = (key, count, options = {}) => {
    return t(key, { count, ...options });
  };

  // Translation with context
  const translateWithContext = (key, context, options = {}) => {
    return t(`${key}_${context}`, options);
  };

  // Translation with gender
  const translateWithGender = (key, gender, options = {}) => {
    return t(`${key}_${gender}`, options);
  };

  // Format date with translation
  const translateDate = (date, options = {}) => {
    return formatDate(date, options);
  };

  // Format number with translation
  const translateNumber = (number, options = {}) => {
    return formatNumber(number, options);
  };

  // Format currency with translation
  const translateCurrency = (amount, currency = 'USD', options = {}) => {
    return formatCurrency(amount, currency, options);
  };

  // Check if translation exists
  const hasTranslation = (key) => {
    return t(key) !== key;
  };

  // Get all translations for a namespace
  const getTranslations = (namespace = null) => {
    const ns = namespace || i18n.options.defaultNS;
    return i18n.getResourceBundle(currentLanguage, ns);
  };

  // Get translation keys
  const getTranslationKeys = (namespace = null) => {
    const translations = getTranslations(namespace);
    return Object.keys(translations);
  };

  // Search translations
  const searchTranslations = (query, namespace = null) => {
    const translations = getTranslations(namespace);
    const keys = Object.keys(translations);
    return keys.filter(key => 
      key.toLowerCase().includes(query.toLowerCase()) ||
      translations[key].toLowerCase().includes(query.toLowerCase())
    );
  };

  // Get translation with interpolation
  const getTranslationWithInterpolation = (key, values = {}) => {
    return t(key, values);
  };

  // Translation with HTML
  const translateHTML = (key, options = {}) => {
    const translation = t(key, options);
    return { __html: translation };
  };

  // Translation with line breaks
  const translateWithLineBreaks = (key, options = {}) => {
    const translation = t(key, options);
    return translation.split('\n').map((line, index) => (
      <span key={`translation-line-${line}`}>
        {line}
        {index < translation.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  // Translation with links
  const translateWithLinks = (key, links = {}, options = {}) => {
    const translation = t(key, options);
    let result = translation;
    
    Object.entries(links).forEach(([placeholder, link]) => {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      result = result.replace(regex, `<a href="${link.url}" target="${link.target || '_blank'}" rel="${link.rel || 'noopener noreferrer'}">${link.text}</a>`);
    });
    
    return { __html: result };
  };

  // Translation with conditional text
  const translateConditional = (key, condition, trueKey, falseKey, options = {}) => {
    const conditionalKey = condition ? trueKey : falseKey;
    return t(`${key}_${conditionalKey}`, options);
  };

  // Translation with array
  const translateArray = (key, array, options = {}) => {
    return array.map((item, index) => t(`${key}.${index}`, { ...options, index }));
  };

  // Translation with object
  const translateObject = (key, obj, options = {}) => {
    const result = {};
    Object.keys(obj).forEach(prop => {
      result[prop] = t(`${key}.${prop}`, { ...options, ...obj[prop] });
    });
    return result;
  };

  // Translation with validation
  const translateValidation = (key, value, rules = {}) => {
    const validationKey = `${key}.validation`;
    const validation = t(validationKey, { value, ...rules });
    return validation !== validationKey ? validation : null;
  };

  // Translation with error handling
  const safeTranslate = (key, options = {}, fallback = key) => {
    try {
      const translation = t(key, options);
      return translation === key ? fallback : translation;
    } catch (error) {
      console.error(`Translation error for key ${key}:`, error);
      return fallback;
    }
  };

  // Translation with caching
  const translateCached = (() => {
    const cache = new Map();
    return (key, options = {}) => {
      const cacheKey = `${key}_${JSON.stringify(options)}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const translation = t(key, options);
      cache.set(cacheKey, translation);
      return translation;
    };
  })();

  return {
    // Basic translation
    t: translate,
    translate,
    
    // Enhanced translation functions
    translateWithFallback,
    translatePlural,
    translateWithContext,
    translateWithGender,
    translateConditional,
    translateArray,
    translateObject,
    translateValidation,
    safeTranslate,
    translateCached,
    
    // Formatting functions
    translateDate,
    translateNumber,
    translateCurrency,
    
    // HTML translation
    translateHTML,
    translateWithLineBreaks,
    translateWithLinks,
    
    // Utility functions
    hasTranslation,
    getTranslations,
    getTranslationKeys,
    searchTranslations,
    getTranslationWithInterpolation,
    
    // i18n instance
    i18n,
    
    // Language context
    currentLanguage,
    isRTL,
    getTextDirection
  };
};

export default useTranslation;




