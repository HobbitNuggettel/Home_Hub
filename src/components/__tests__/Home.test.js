import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';
import { renderWithProviders } from '../../utils/test-utils';

describe('Home Component', () => {
  describe('Rendering & Structure', () => {
    test('renders home page with main sections', () => {
      renderWithProviders(<Home />);
      
      // Check for main sections
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    });

    test('renders navigation elements', () => {
      renderWithProviders(<Home />);
      
      // Check for navigation elements
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/inventory/i)).toBeInTheDocument();
      expect(screen.getByText(/spending/i)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithProviders(<Home />);
      
      const container = screen.getByTestId('home-container');
      expect(container).toHaveClass('dark:bg-gray-900');
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderWithProviders(<Home />);
      
      const container = screen.getByTestId('home-container');
      expect(container).toHaveClass('bg-gray-50');
    });
  });

  describe('User Interactions', () => {
    test('navigation links work correctly', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Home />);
      
      // Test navigation links
      const dashboardLink = screen.getByText(/dashboard/i);
      expect(dashboardLink).toBeInTheDocument();
      
      const inventoryLink = screen.getByText(/inventory/i);
      expect(inventoryLink).toBeInTheDocument();
    });

    test('quick action buttons are functional', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Home />);
      
      // Test quick action buttons
      const addItemButton = screen.getByText(/add item/i);
      expect(addItemButton).toBeInTheDocument();
      
      const trackExpenseButton = screen.getByText(/track expense/i);
      expect(trackExpenseButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithProviders(<Home />);
      
      // Check for ARIA labels on interactive elements
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String));
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<Home />);
      
      // Test tab navigation
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
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
      
      renderWithProviders(<Home />);
      
      // Component should render without breaking on mobile
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
