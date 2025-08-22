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
    const saved = localStorage.getItem('themeMode');
    if (saved !== null && ['light', 'dark', 'system'].includes(saved)) {
      // Theme values are simple strings, validate before using
      console.log('Theme mode loaded from localStorage:', saved);
      return saved;
    }
    console.log('No saved theme or invalid theme, defaulting to system');
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Determine initial dark mode based on theme mode
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    // For 'system', check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [theme, setTheme] = useState(() => {
    return isDarkMode ? 'dark' : 'light';
  });

  useEffect(() => {
    console.log('Theme effect running, themeMode:', themeMode, 'isDarkMode:', isDarkMode);
    
    // Update theme when dark mode changes
    setTheme(isDarkMode ? 'dark' : 'light');
    
    // Save theme mode to localStorage
    localStorage.setItem('themeMode', themeMode);
    
    // Update document class for global CSS
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      console.log('Dark mode enabled - added dark class');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('Dark mode disabled - removed dark class');
    }
  }, [isDarkMode, themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        console.log('System theme changed to:', e.matches ? 'dark' : 'light');
        setIsDarkMode(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  const updateThemeMode = (mode) => {
    console.log('Setting theme mode to:', mode);
    setThemeMode(mode);
    
    if (mode === 'dark') {
      setIsDarkMode(true);
    } else if (mode === 'light') {
      setIsDarkMode(false);
    } else if (mode === 'system') {
      // Use system preference
      const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(systemPref);
    }
  };

  const toggleDarkMode = () => {
    console.log('Toggle dark mode called, current state:', isDarkMode);
    // Toggle between light and dark, not system
    if (themeMode === 'system') {
      setThemeMode('dark');
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

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
