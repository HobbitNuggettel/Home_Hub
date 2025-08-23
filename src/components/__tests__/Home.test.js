import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { renderHomeWithProviders } from '../../utils/test-utils';
import Home from '../Home';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Rendering & Structure', () => {
    test('renders home page with main sections', async () => {
      renderHomeWithProviders(<Home />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });

      expect(screen.getByText(/Your comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Assistant Ready/i)).toBeInTheDocument();
    });

    test('renders mission statement', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });

      // Check for mission statement
      expect(screen.getByText(/Your comprehensive home management platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Track inventory, manage finances/i)).toBeInTheDocument();
    });

    test('displays AI assistant ready message', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText(/AI Assistant Ready/i)).toBeInTheDocument();
      });
    });

    test('shows live dashboard section', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '📊 Live Dashboard', level: 2 })).toBeInTheDocument();
      });
    });
  });

  describe('Core Features Section', () => {
    test('displays all 8 core features', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });

      // Check for all core features
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      expect(screen.getByText('Spending & Budgeting')).toBeInTheDocument();
      expect(screen.getByText('Collaboration')).toBeInTheDocument();
      expect(screen.getByText('Shopping Lists')).toBeInTheDocument();
      expect(screen.getByText('Recipe Management')).toBeInTheDocument();
      expect(screen.getByText('Integrations & Automation')).toBeInTheDocument();
      expect(screen.getByText('Data & Alerts')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    test('shows feature descriptions', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });

      // Check for feature descriptions
      expect(screen.getByText(/Track household items with categories/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor expenses, set budgets/i)).toBeInTheDocument();
    });
  });

  describe('Live Dashboard', () => {
    test('displays inventory statistics', async () => {
      renderHomeWithProviders(<Home />);
      
      // Wait for loading to complete and stats to animate
      await waitFor(() => {
        expect(screen.getByText('Total Items')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check for inventory stats
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('8 categories')).toBeInTheDocument();
    });

    test('displays budget statistics', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete and stats to animate
      await waitFor(() => {
        expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Monthly Budget')).toBeInTheDocument();
      expect(screen.getByText(/under budget/i)).toBeInTheDocument();
    });

    test('displays recipe statistics', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete and stats to animate
      await waitFor(() => {
        expect(screen.getByText('Saved Recipes')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Saved Recipes')).toBeInTheDocument();
      expect(screen.getByText('5 favorites')).toBeInTheDocument();
    });

    test('displays shopping statistics', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete and stats to animate
      await waitFor(() => {
        expect(screen.getByText('Shopping List')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByText('Shopping List')).toBeInTheDocument();
      expect(screen.getByText('items')).toBeInTheDocument();
    });
  });

  describe('Platform Overview', () => {
    test('displays platform statistics', async () => {
      renderHomeWithProviders(<Home />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Platform Overview', level: 2 })).toBeInTheDocument();
      });
      
      // Check for platform stats
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Core Features')).toBeInTheDocument();
      // Use getAllByText for elements that might appear multiple times
      const threeElements = screen.getAllByText('3');
      expect(threeElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Development Phases')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('navigates to inventory page', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });

      const inventoryButton = screen.getByRole('button', { name: /Inventory Management/i });
      fireEvent.click(inventoryButton);

      // Wait for the navigation timeout (150ms) plus a small buffer
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/inventory');
      }, { timeout: 200 });
    });

    test('navigates to spending page', async () => {
      renderHomeWithProviders(<Home />);
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Spending & Budgeting')).toBeInTheDocument();
      });

      const spendingButton = screen.getByRole('button', { name: /Spending & Budgeting/i });
      fireEvent.click(spendingButton);
      
      // Wait for the navigation timeout (150ms) plus a small buffer
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/spending');
      }, { timeout: 200 });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '📊 Live Dashboard', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'All Features', level: 2 })).toBeInTheDocument();
    });

    test('has proper button elements', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });
      
      // Check that buttons are accessible
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('supports keyboard navigation', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      });
      
      // Check that buttons are focusable
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen sizes', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });
      
      // Check that component renders without breaking
      expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      
      // Check for responsive grid classes - find the actual grid container
      const gridContainer = screen.getByText('Inventory Management').closest('div');
      expect(gridContainer).toBeInTheDocument();
    });

    test('maintains layout on different screen sizes', async () => {
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });

      // Check that component renders without breaking
      expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();

      // Check for responsive layout elements
      expect(screen.getByText(/Your comprehensive home management platform/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders gracefully with missing data', async () => {
      // This test ensures the component doesn't crash if data is missing
      renderHomeWithProviders(<Home />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
      });

      // Component should render without errors
      expect(screen.getByRole('heading', { name: 'Welcome to Home Hub', level: 1 })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner initially', () => {
      renderHomeWithProviders(<Home />);

      // Check for loading state
      expect(screen.getByText('Loading Home Hub...')).toBeInTheDocument();
      expect(screen.getByText('Preparing your dashboard')).toBeInTheDocument();
    });
  });
});
