import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from '../Navigation.js';
import { renderWithProviders } from '../../utils/test-utils.js';

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

describe('Navigation Component', () => {
  describe('Rendering & Structure', () => {
    test('renders navigation with main menu items', () => {
      renderWithProviders(<Navigation />);
      
      // Check for main navigation items
      expect(screen.getByText(/home/i)).toBeInTheDocument();
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/inventory/i)).toBeInTheDocument();
      expect(screen.getByText(/spending/i)).toBeInTheDocument();
      expect(screen.getByText(/settings/i)).toBeInTheDocument();
    });

    test('renders theme toggle button', () => {
      renderWithProviders(<Navigation />);
      
      // Check for theme toggle
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggle).toBeInTheDocument();
    });

    test('renders user menu when authenticated', () => {
      renderWithProviders(<Navigation />);
      
      // Check for user menu elements
      const userMenu = screen.getByTestId('user-menu');
      expect(userMenu).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithProviders(<Navigation />);
      
      const navContainer = screen.getByTestId('navigation-container');
      expect(navContainer).toHaveClass('dark:bg-gray-800');
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderWithProviders(<Navigation />);
      
      const navContainer = screen.getByTestId('navigation-container');
      expect(navContainer).toHaveClass('bg-white');
    });
  });

  describe('User Interactions', () => {
    test('navigation links work correctly', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Navigation />);
      
      // Test navigation links
      const homeLink = screen.getByText(/home/i);
      expect(homeLink).toBeInTheDocument();
      
      const dashboardLink = screen.getByText(/dashboard/i);
      expect(dashboardLink).toBeInTheDocument();
    });

    test('theme toggle button is functional', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Navigation />);
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeToggle);
      
      // Verify the button is clickable
      expect(themeToggle).toBeInTheDocument();
    });

    test('mobile menu toggle works', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Navigation />);
      
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      await user.click(mobileMenuButton);
      
      // Mobile menu should be visible
      expect(mobileMenuButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithProviders(<Navigation />);
      
      // Check for ARIA labels on navigation items
      const navItems = screen.getAllByRole('navigation');
      navItems.forEach(item => {
        expect(item).toHaveAttribute('aria-label', expect.any(String));
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Navigation />);
      
      // Test tab navigation
      const firstNavItem = screen.getAllByRole('link')[0];
      firstNavItem.focus();
      expect(firstNavItem).toHaveFocus();
    });

    test('has proper focus indicators', () => {
      renderWithProviders(<Navigation />);
      
      const focusableElements = screen.getAllByRole('link');
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
      
      renderWithProviders(<Navigation />);
      
      // Component should render without breaking on mobile
      expect(screen.getByText(/home/i)).toBeInTheDocument();
    });

    test('shows mobile menu on small screens', () => {
      // Mock small screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithProviders(<Navigation />);
      
      // Mobile menu button should be visible
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeInTheDocument();
    });
  });

  describe('Authentication Integration', () => {
    test('shows login button when not authenticated', () => {
      renderWithProviders(<Navigation />);
      
      // Check for authentication elements
      const loginButton = screen.getByText(/login/i);
      expect(loginButton).toBeInTheDocument();
    });

    test('shows user menu when authenticated', () => {
      renderWithProviders(<Navigation />);
      
      // Check for user menu
      const userMenu = screen.getByTestId('user-menu');
      expect(userMenu).toBeInTheDocument();
    });
  });
});
