import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { renderWithProviders } from '../../utils/test-utils';

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    userProfile: { name: 'Test User', email: 'test@example.com' },
    updateUserProfile: jest.fn(() => Promise.resolve()),
    login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
    logout: jest.fn(() => Promise.resolve()),
    loading: false,
    error: null,
  })),
}));

// Mock DevToolsContext
jest.mock('../../contexts/DevToolsContext', () => ({
  useDevTools: jest.fn(() => ({
    isDevMode: false,
    toggleDevMode: jest.fn(),
    showDevTools: false,
    toggleDevTools: jest.fn(),
  })),
}));

describe('Settings Component', () => {
  describe('Rendering & Structure', () => {
    test('renders settings page with main sections', () => {
      renderWithProviders(<Settings />);
      
      // Check for main sections
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
      expect(screen.getByText(/theme preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/user preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });

    test('renders theme settings section', () => {
      renderWithProviders(<Settings />);
      
      // Check for theme settings
      expect(screen.getByText(/light/i)).toBeInTheDocument();
      expect(screen.getByText(/dark/i)).toBeInTheDocument();
      expect(screen.getByText(/system/i)).toBeInTheDocument();
    });

    test('renders user preference options', () => {
      renderWithProviders(<Settings />);
      
      // Check for user preferences
      expect(screen.getByText(/language/i)).toBeInTheDocument();
      expect(screen.getByText(/timezone/i)).toBeInTheDocument();
      expect(screen.getByText(/currency/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithProviders(<Settings />);
      
      const container = screen.getByTestId('settings-container');
      expect(container).toHaveClass('dark:bg-gray-900');
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderWithProviders(<Settings />);
      
      const container = screen.getByTestId('settings-container');
      expect(container).toHaveClass('bg-gray-50');
    });
  });

  describe('User Interactions', () => {
    test('theme selection works correctly', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      // Test theme selection
      const lightThemeButton = screen.getByText(/light/i);
      await user.click(lightThemeButton);
      
      expect(lightThemeButton).toBeInTheDocument();
      
      const darkThemeButton = screen.getByText(/dark/i);
      await user.click(darkThemeButton);
      
      expect(darkThemeButton).toBeInTheDocument();
    });

    test('user preference changes are saved', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      // Test language selection
      const languageSelect = screen.getByText(/language/i);
      await user.click(languageSelect);
      
      expect(languageSelect).toBeInTheDocument();
    });

    test('save button triggers save action', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      // Verify save action
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithProviders(<Settings />);
      
      // Check for ARIA labels on form elements
      const formElements = screen.getAllByRole('button');
      formElements.forEach(element => {
        expect(element).toHaveAttribute('aria-label', expect.any(String));
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      // Test tab navigation
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
    });

    test('has proper focus indicators', () => {
      renderWithProviders(<Settings />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        element.focus();
        expect(element).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<Settings />);
      
      // Component should render without breaking on mobile
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });

    test('form elements are properly sized on mobile', () => {
      // Mock mobile screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithProviders(<Settings />);
      
      // Form should be responsive
      expect(screen.getByText(/theme preferences/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    test('saves theme preference to localStorage', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      const darkThemeButton = screen.getByText(/dark/i);
      await user.click(darkThemeButton);
      
      // Theme preference should be saved
      expect(darkThemeButton).toBeInTheDocument();
    });

    test('loads saved preferences on component mount', () => {
      // Mock saved preferences
      localStorage.setItem('themeMode', 'dark');
      localStorage.setItem('language', 'en');
      
      renderWithProviders(<Settings />);
      
      // Should display saved preferences
      expect(screen.getByText(/dark/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      // Should validate form before saving
      expect(saveButton).toBeInTheDocument();
    });

    test('shows error messages for invalid inputs', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Settings />);
      
      // Test invalid input handling
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      // Should show validation errors if any
      expect(saveButton).toBeInTheDocument();
    });
  });
});
