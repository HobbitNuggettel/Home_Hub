import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Check localStorage first, then default to 'system'
    try {
      const saved = localStorage.getItem('themeMode');
      if (saved !== null && ['light', 'dark', 'system'].includes(saved)) {
        // Theme values are simple strings, validate before using
        return saved;
      }
    } catch (error) {
      // Continue with default
    }
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Determine initial dark mode based on theme mode
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // For 'system', check system preference - with safety check for test environment
    if (typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
          return mediaQuery.matches;
        }
      } catch (error) {
        // Fallback for test environment or when matchMedia fails
      }
    }
    // Fallback for test environment or when matchMedia is not available
    return false;
  });

  const [theme, setTheme] = useState(() => {
    return isDarkMode ? 'dark' : 'light';
  });

  useEffect(() => {
    // Update theme when dark mode changes
    setTheme(isDarkMode ? 'dark' : 'light');
    
    // Save theme mode to localStorage with error handling
    try {
      localStorage.setItem('themeMode', themeMode);
    } catch (error) {
      // Continue without crashing
    }
    
    // Update document class for global CSS
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
          const handleChange = (e) => {
            setIsDarkMode(e.matches);
          };

          mediaQuery.addEventListener('change', handleChange);
          return () => mediaQuery.removeEventListener('change', handleChange);
        }
      } catch (error) {
        // Event listener setup failed
      }
    }
  }, [themeMode]);

  const updateThemeMode = (mode) => {
    setThemeMode(mode);
    
    if (mode === 'dark') {
      setIsDarkMode(true);
    } else if (mode === 'light') {
      setIsDarkMode(false);
    } else if (mode === 'system') {
      // Use system preference - with safety check
      if (typeof window !== 'undefined' && window.matchMedia && typeof window.matchMedia === 'function') {
        try {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
            const systemPref = mediaQuery.matches;
            setIsDarkMode(systemPref);
          } else {
            setIsDarkMode(false);
          }
        } catch (error) {
          // matchMedia failed in updateThemeMode, using fallback
          setIsDarkMode(false);
        }
      } else {
        // Fallback for test environment
        setIsDarkMode(false);
      }
    }
  };

  const toggleDarkMode = () => {
    // When in system mode, toggle should not change theme mode
    if (themeMode === 'system') {
      // Do nothing - stay in system mode
      return;
    } else if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const value = {
    isDarkMode,
    theme,
    themeMode,
    toggleDarkMode,
    setThemeMode: updateThemeMode
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: value },
    children
  );
};
