import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Default color schemes
const DEFAULT_THEMES = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    accent: '#34d399',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa'
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem('homeHub-theme-mode');
      if (saved !== null && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
    return 'system';
  });

  const [customColors, setCustomColors] = useState(() => {
    try {
      const saved = localStorage.getItem('homeHub-custom-colors');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      // Silently handle localStorage errors
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    if (typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
          return mediaQuery.matches;
        }
      } catch (error) {
        // Silently handle system theme check errors
      }
    }
    return false;
  });

  const [theme, setTheme] = useState(() => {
    return isDarkMode ? 'dark' : 'light';
  });

  // Get current color scheme (custom or default)
  const getCurrentColors = () => {
    if (customColors) {
      return customColors;
    }
    return DEFAULT_THEMES[theme];
  };

  const [colors, setColors] = useState(getCurrentColors);

  // Apply colors to CSS custom properties
  const applyColorsToDocument = (colorScheme) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    Object.entries(colorScheme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  // Update colors when theme or custom colors change
  useEffect(() => {
    const newColors = getCurrentColors();
    setColors(newColors);
    applyColorsToDocument(newColors);
  }, [theme, customColors, getCurrentColors, applyColorsToDocument]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
      setTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // Update theme when mode changes
  useEffect(() => {
    if (themeMode === 'dark') {
      setIsDarkMode(true);
      setTheme('dark');
    } else if (themeMode === 'light') {
      setIsDarkMode(false);
      setTheme('light');
    } else {
      // System mode - check if matchMedia is available (for tests)
      if (typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
        try {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const systemPrefersDark = mediaQuery && mediaQuery.matches;
          setIsDarkMode(systemPrefersDark);
          setTheme(systemPrefersDark ? 'dark' : 'light');
        } catch (error) {
          // Fallback for test environment
          setIsDarkMode(false);
          setTheme('light');
        }
      } else {
        // Fallback for test environment
        setIsDarkMode(false);
        setTheme('light');
      }
    }
  }, [themeMode]);

  // Save theme mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('homeHub-theme-mode', themeMode);
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [themeMode]);

  // Save custom colors to localStorage
  useEffect(() => {
    try {
      if (customColors) {
        localStorage.setItem('homeHub-custom-colors', JSON.stringify(customColors));
      } else {
        localStorage.removeItem('homeHub-custom-colors');
      }
    } catch (error) {
    // Silently handle localStorage errors
    }
  }, [customColors]);

  const updateThemeMode = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) {
      // Invalid theme mode, ignore
      return;
    }
    setThemeMode(mode);
  };

  const toggleDarkMode = () => {
    if (themeMode === 'system') {
      updateThemeMode(isDarkMode ? 'light' : 'dark');
    } else {
      updateThemeMode(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  const setCustomTheme = (newColors) => {
    setCustomColors(newColors);
  };

  const resetToDefaultTheme = () => {
    setCustomColors(null);
  };

  const exportTheme = () => {
    const themeData = {
      name: 'Custom Theme',
      colors: colors,
      mode: themeMode,
      createdAt: new Date().toISOString()
    };
    return JSON.stringify(themeData, null, 2);
  };

  const importTheme = (themeData) => {
    try {
      const parsed = JSON.parse(themeData);
      if (parsed.colors && typeof parsed.colors === 'object') {
        setCustomTheme(parsed.colors);
        if (parsed.mode) {
          updateThemeMode(parsed.mode);
        }
        return true;
      }
    } catch (error) {
      // Failed to import theme, use default
    }
    return false;
  };

  const getThemePresets = () => {
    return {
      'Default Light': DEFAULT_THEMES.light,
      'Default Dark': DEFAULT_THEMES.dark,
      'Blue Theme': {
        primary: '#2563eb',
        secondary: '#7c3aed',
        accent: '#059669',
        background: '#ffffff',
        surface: '#f1f5f9',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#cbd5e1',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#2563eb'
      },
      'Purple Theme': {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#faf5ff',
        text: '#1e1b4b',
        textSecondary: '#6b7280',
        border: '#d8b4fe',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#7c3aed'
      },
      'Green Theme': {
        primary: '#059669',
        secondary: '#0891b2',
        accent: '#dc2626',
        background: '#ffffff',
        surface: '#f0fdf4',
        text: '#064e3b',
        textSecondary: '#6b7280',
        border: '#bbf7d0',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0891b2'
      }
    };
  };

  const value = {
    themeMode,
    isDarkMode,
    theme,
    colors,
    customColors,
    updateThemeMode,
    toggleDarkMode,
    setCustomTheme,
    resetToDefaultTheme,
    exportTheme,
    importTheme,
    getThemePresets,
    isCustomTheme: !!customColors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};