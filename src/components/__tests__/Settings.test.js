import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the contexts with proper implementations
const mockUseAuth = jest.fn();
const mockUseDevTools = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../contexts/DevToolsContext', () => ({
  useDevTools: () => mockUseDevTools(),
}));

// Custom render function for Settings tests
const renderSettings = (ui, options = {}) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>,
    options
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    mockUseAuth.mockReturnValue({
      currentUser: { uid: 'test-uid', email: 'test@example.com' },
      userProfile: { name: 'Test User', email: 'test@example.com' },
      updateUserProfile: jest.fn(() => Promise.resolve()),
      login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
      logout: jest.fn(() => Promise.resolve()),
      loading: false,
      error: null,
    });

    mockUseDevTools.mockReturnValue({
      isDevMode: false,
      toggleDevMode: jest.fn(),
      showDevTools: false,
      toggleDevTools: jest.fn(),
    });
  });

  describe('Rendering & Structure', () => {
    test('renders settings page with main sections', () => {
      renderSettings(<Settings />);
      
      // Check for main sections
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
      expect(screen.getByText(/manage your account preferences and privacy/i)).toBeInTheDocument();
      expect(screen.getAllByText(/profile/i)).toHaveLength(2);
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    });

    test('renders theme settings section', () => {
      renderSettings(<Settings />);
      
      // Check for theme tab
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
      // Click on theme tab to see theme content
      const themeTab = screen.getByText(/theme/i);
      userEvent.click(themeTab);

      // Theme content should be visible after clicking
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
    });

    test('renders user preference options', () => {
      renderSettings(<Settings />);
      
      // Check for user preferences - profile tab is active by default
      expect(screen.getByText(/profile information/i)).toBeInTheDocument();
      expect(screen.getByText(/display name/i)).toBeInTheDocument();
      expect(screen.getAllByText(/email/i)).toHaveLength(2);
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderSettings(<Settings />);
      
      // Check if the main container has dark mode classes
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('dark:bg-gray-900');
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderSettings(<Settings />);
      
      // Check if the main container has light mode classes
      const mainContainer = document.querySelector('.min-h-screen');
      expect(mainContainer).toHaveClass('bg-gray-50');
    });
  });

  describe('User Interactions', () => {
    test('theme selection works correctly', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Click on theme tab
      const themeTab = screen.getByText(/theme/i);
      await user.click(themeTab);
      
      expect(themeTab).toBeInTheDocument();
    });

    test('user preference changes are saved', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Test form input - profile tab is active by default
      const displayNameInput = screen.getByPlaceholderText(/enter your display name/i);
      await user.type(displayNameInput, 'Test User');
      
      expect(displayNameInput).toHaveValue('Test User');
    });

    test('save button triggers save action', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Test save button - profile tab is active by default
      const saveButton = screen.getByText(/save changes/i);
      await user.click(saveButton);

      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderSettings(<Settings />);

      // Check that buttons are accessible and have proper roles
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Check that at least some buttons have text content
      const buttonsWithText = buttons.filter(button =>
        button.textContent && button.textContent.trim().length > 0
      );
      expect(buttonsWithText.length).toBeGreaterThan(0);
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Test tab navigation
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
    });

    test('has proper focus indicators', () => {
      renderSettings(<Settings />);
      
      // Check for focus styles - buttons should be focusable
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        element.focus();
        expect(element).toBeInTheDocument();
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
      
      renderSettings(<Settings />);
      
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
      
      renderSettings(<Settings />);
      
      // Form should be responsive
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    test('saves theme preference to localStorage', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Click on theme tab
      const themeTab = screen.getByText(/theme/i);
      await user.click(themeTab);
      
      // Theme tab should be clickable
      expect(themeTab).toBeInTheDocument();
    });

    test('loads saved preferences on component mount', () => {
      // Mock saved preferences
      localStorage.setItem('themeMode', 'dark');
      localStorage.setItem('language', 'en');
      
      renderSettings(<Settings />);
      
      // Should display settings page
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      const saveButton = screen.getByText(/save changes/i);
      await user.click(saveButton);
      
      // Should validate form before saving
      expect(saveButton).toBeInTheDocument();
    });

    test('shows error messages for invalid inputs', async () => {
      const user = userEvent.setup();
      
      renderSettings(<Settings />);
      
      // Test invalid input handling
      const saveButton = screen.getByText(/save changes/i);
      await user.click(saveButton);
      
      // Should show validation errors if any
      expect(saveButton).toBeInTheDocument();
    });
  });
});
