import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '../ThemeContext.js';
import { renderWithProviders } from '../../utils/test-utils.js';

// Test component to access theme context
const TestComponent = () => {
  const { themeMode, isDarkMode, toggleDarkMode, setThemeMode } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-mode">{themeMode}</div>
      <div data-testid="is-dark-mode">{isDarkMode.toString()}</div>
      <button onClick={toggleDarkMode} data-testid="toggle-button">
        Toggle Theme
      </button>
      <button onClick={() => setThemeMode('light')} data-testid="light-button">
        Light
      </button>
      <button onClick={() => setThemeMode('dark')} data-testid="dark-button">
        Dark
      </button>
      <button onClick={() => setThemeMode('system')} data-testid="system-button">
        System
      </button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Reset matchMedia mock
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('defaults to system theme when no preference is stored', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
    });

    test('loads stored theme preference from localStorage', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });

    test('handles invalid stored theme gracefully', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('invalid-theme');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Should default to system
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
    });
  });

  describe('Theme Mode Switching', () => {
    test('updateThemeMode changes theme mode correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially system
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');

      // Switch to light
      await user.click(screen.getByTestId('light-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      // Switch to dark
      await user.click(screen.getByTestId('dark-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      // Switch to system
      await user.click(screen.getByTestId('system-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
    });

    test('toggleDarkMode cycles between light and dark when not in system mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to light mode first
      await user.click(screen.getByTestId('light-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      // Toggle should go to dark
      await user.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      // Toggle should go back to light
      await user.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });

    test('toggleDarkMode does not change theme when in system mode', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Ensure we're in system mode
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');

      // Toggle should not change theme mode
      await user.click(screen.getByTestId('toggle-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('system');
    });
  });

  describe('Dark Mode Detection', () => {
    test('isDarkMode is true when theme is dark', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });

    test('isDarkMode is false when theme is light', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    test('isDarkMode follows system preference when theme is system', () => {
      // Mock system prefers dark
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');
    });

    test('isDarkMode follows system preference when theme is system (light)', () => {
      // Mock system prefers light
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });
  });

  describe('Persistence', () => {
    test('theme preference is saved to localStorage', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Switch to dark mode
      await user.click(screen.getByTestId('dark-button'));
      
      expect(localStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark');
    });

    test('theme preference persists across component re-renders', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Switch to light mode
      await user.click(screen.getByTestId('light-button'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      // Re-render the component
      rerender(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Theme should still be light
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
  });

  describe('System Preference Changes', () => {
    test('responds to system preference changes when in system mode', () => {
      let changeCallback;
      
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            changeCallback = callback;
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially dark mode (system preference)
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('true');

      // Simulate system preference change to light
      act(() => {
        if (changeCallback) {
          changeCallback({ matches: false });
        }
      });

      // Should now be light mode
      expect(screen.getByTestId('is-dark-mode')).toHaveTextContent('false');
    });

    test('does not respond to system preference changes when not in system mode', () => {
      let changeCallback;
      
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event, callback) => {
          if (event === 'change') {
            changeCallback = callback;
          }
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Switch to light mode (explicit)
      act(() => {
        const lightButton = screen.getByTestId('light-button');
        fireEvent.click(lightButton);
      });

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

      // Simulate system preference change
      act(() => {
        if (changeCallback) {
          changeCallback({ matches: false });
        }
      });

      // Should still be light mode (not affected by system change)
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
  });

  describe('Edge Cases', () => {
    test('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not crash
      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      // Restore original function
      localStorage.setItem = originalSetItem;
    });

    test('handles matchMedia not supported', () => {
      // Mock matchMedia as undefined
      const originalMatchMedia = window.matchMedia;
      delete window.matchMedia;

      // Should not crash
      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      // Restore original function
      window.matchMedia = originalMatchMedia;
    });

    test('handles rapid theme changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Rapidly change themes
      await user.click(screen.getByTestId('light-button'));
      await user.click(screen.getByTestId('dark-button'));
      await user.click(screen.getByTestId('system-button'));
      await user.click(screen.getByTestId('light-button'));

      // Should end up in light mode
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
  });

  describe('Integration with DOM', () => {
    test('adds dark class to document when in dark mode', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('dark');
    });

    test('removes dark class from document when in light mode', () => {
      // Use the mocked localStorage
      window.localStorage.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement).not.toHaveClass('dark');
    });

    test('updates document class when theme changes', async () => {
      const user = userEvent.setup();
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Initially no dark class (system mode)
      expect(document.documentElement).not.toHaveClass('dark');

      // Switch to dark mode
      await user.click(screen.getByTestId('dark-button'));
      expect(document.documentElement).toHaveClass('dark');

      // Switch to light mode
      await user.click(screen.getByTestId('light-button'));
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });
});
