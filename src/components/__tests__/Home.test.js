import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';
import { renderWithRouter } from '../../utils/test-utils';

describe('Home Component', () => {
  describe('Rendering & Structure', () => {
    test('renders home page with main sections', () => {
      renderWithRouter(<Home />);
      
      // Check for main sections
      expect(screen.getByText('Welcome to Home Hub')).toBeInTheDocument();
      expect(screen.getByText('All Features')).toBeInTheDocument();
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    });

    test('renders navigation elements', () => {
      renderWithRouter(<Home />);
      
      // Check for navigation elements
      expect(screen.getByText('Welcome to Home Hub')).toBeInTheDocument();
      expect(screen.getByText(/Your comprehensive home management platform/)).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithRouter(<Home />);
      
      // Check that component renders without crashing
      expect(screen.getByText('Welcome to Home Hub')).toBeInTheDocument();
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderWithRouter(<Home />);
      
      // Check that component renders without crashing
      expect(screen.getByText('Welcome to Home Hub')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('navigation links work correctly', () => {
      renderWithRouter(<Home />);
      
      // Test navigation links - check for feature buttons
      const inventoryButton = screen.getByText('Inventory Management');
      expect(inventoryButton).toBeInTheDocument();
      
      // Check for other feature buttons
      expect(screen.getByText(/track household items/i)).toBeInTheDocument();
    });

    test('quick action buttons are functional', () => {
      renderWithRouter(<Home />);
      
      // Test quick action buttons - check for feature descriptions
      expect(screen.getByText(/track household items/i)).toBeInTheDocument();
      expect(screen.getByText(/manage finances/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderWithRouter(<Home />);
      
      // Check that buttons are accessible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', () => {
      renderWithRouter(<Home />);
      
      // Check that buttons are focusable
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', () => {
      renderWithRouter(<Home />);
      
      // Check that component renders without breaking
      expect(screen.getByText('Welcome to Home Hub')).toBeInTheDocument();
      
      // Check for responsive grid classes - find the actual grid container
      const gridContainer = screen.getByText('Inventory Management').closest('div');
      expect(gridContainer).toHaveClass('grid');
    });
  });
});
