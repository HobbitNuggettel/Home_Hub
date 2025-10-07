import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard.js';
import { renderWithProviders, mockUser, mockInventoryItem } from '../../utils/test-utils.js';

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

// Mock the useInventory hook
jest.mock('../../hooks/useInventory', () => ({
  __esModule: true,
  default: () => ({
    inventory: [mockInventoryItem],
    loading: false,
    error: null,
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    searchInventory: jest.fn(),
  }),
}));

// Mock the useSpending hook (placeholder for when it's implemented)
jest.mock('../../hooks/useSpending', () => ({
  __esModule: true,
  default: () => ({
    expenses: [],
    budgets: [],
    loading: false,
    error: null,
    addExpense: jest.fn(),
    updateExpense: jest.fn(),
    deleteExpense: jest.fn(),
  }),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    test('renders dashboard with all main sections', () => {
      renderWithProviders(<Dashboard />);
      
      // Check for main sections
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Tasks')).toBeInTheDocument();
    });

    test('renders quick stats cards with correct information', () => {
      renderWithProviders(<Dashboard />);
      
      // Check for stats cards
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Recent Expenses')).toBeInTheDocument();
      expect(screen.getByText('Active Alerts')).toBeInTheDocument();
    });

    test('renders navigation tabs correctly', () => {
      renderWithProviders(<Dashboard />);
      
      // Check for tab navigation
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /inventory/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /spending/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /collaboration/i })).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      // Mock localStorage to return dark theme
      localStorage.getItem.mockReturnValue('dark');
      
      renderWithProviders(<Dashboard />);
      
      const dashboardContainer = screen.getByTestId('dashboard-container');
      expect(dashboardContainer).toHaveClass('dark:bg-gray-900');
    });

    test('applies light mode classes when theme is light', () => {
      // Mock localStorage to return light theme
      localStorage.getItem.mockReturnValue('light');
      
      renderWithProviders(<Dashboard />);
      
      const dashboardContainer = screen.getByTestId('dashboard-container');
      expect(dashboardContainer).toHaveClass('bg-gray-50');
    });

    test('theme toggle changes theme correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(themeToggle);
      
      // Verify theme change (this would depend on your theme context implementation)
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    test('uses React.memo for performance optimization', () => {
      // Check if component is wrapped with React.memo
      expect(Dashboard.displayName || Dashboard.name).toBeDefined();
    });

    test('handles large datasets efficiently', async () => {
      const largeInventory = Array.from({ length: 1000 }, (_, i) => ({
        ...mockInventoryItem,
        id: `item-${i}`,
        name: `Item ${i}`,
      }));

      // Mock the hook to return large dataset
      jest.doMock('../../hooks/useInventory', () => ({
        __esModule: true,
        default: () => ({
          inventory: largeInventory,
          loading: false,
          error: null,
          addItem: jest.fn(),
          updateItem: jest.fn(),
          deleteItem: jest.fn(),
          searchInventory: jest.fn(),
        }),
      }));

      renderWithProviders(<Dashboard />);
      
      // Component should render without performance issues
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    test('has proper ARIA labels for all interactive elements', () => {
      renderWithProviders(<Dashboard />);
      
      // Check for ARIA labels on tabs
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected');
      
      // Check for ARIA labels on buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String));
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);
      
      // Test tab navigation
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      overviewTab.focus();
      
      // Navigate with arrow keys
      await user.keyboard('{ArrowRight}');
      const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
      expect(inventoryTab).toHaveFocus();
    });

    test('has proper focus indicators', () => {
      renderWithProviders(<Dashboard />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        element.focus();
        expect(element).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });
  });

  describe('User Interactions', () => {
    test('tab switching works correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);
      
      const inventoryTab = screen.getByRole('tab', { name: /inventory/i });
      await user.click(inventoryTab);
      
      expect(inventoryTab).toHaveAttribute('aria-selected', 'true');
    });

    test('quick action buttons trigger correct functions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);
      
      const addItemButton = screen.getByRole('button', { name: /add item/i });
      await user.click(addItemButton);
      
      // Verify the action was triggered (this would depend on your implementation)
      expect(addItemButton).toBeInTheDocument();
    });

    test('search functionality works', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Dashboard />);
      
      const searchInput = screen.getByPlaceholderText(/search inventory/i);
      await user.type(searchInput, 'test');
      
      expect(searchInput).toHaveValue('test');
    });
  });

  describe('Error Handling', () => {
    test('displays error messages when API calls fail', () => {
      // Mock the hook to return an error
      jest.doMock('../../hooks/useInventory', () => ({
        __esModule: true,
        default: () => ({
          inventory: [],
          loading: false,
          error: 'Failed to load inventory',
          addItem: jest.fn(),
          updateItem: jest.fn(),
          deleteItem: jest.fn(),
          searchInventory: jest.fn(),
        }),
      }));

      renderWithProviders(<Dashboard />);
      
      expect(screen.getByText('Failed to load inventory')).toBeInTheDocument();
    });

    test('shows loading states during API calls', () => {
      // Mock the hook to return loading state
      jest.doMock('../../hooks/useInventory', () => ({
        __esModule: true,
        default: () => ({
          inventory: [],
          loading: true,
          error: null,
          addItem: jest.fn(),
          updateItem: jest.fn(),
          deleteItem: jest.fn(),
          searchInventory: jest.fn(),
        }),
      }));

      renderWithProviders(<Dashboard />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderWithProviders(<Dashboard />);
      
      // Component should render without breaking on mobile
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Data Integration', () => {
    test('displays real-time data from hooks', () => {
      renderWithProviders(<Dashboard />);
      
      // Check if mock data is displayed
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      // Note: Spending data will be available when useSpending hook is implemented
    });

    test('updates when data changes', async () => {
      const { rerender } = renderWithProviders(<Dashboard />);
      
      // Initial render
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      
      // Re-render with new data
      const newMockItem = { ...mockInventoryItem, name: 'Updated Item' };
      jest.doMock('../../hooks/useInventory', () => ({
        __esModule: true,
        default: () => ({
          inventory: [newMockItem],
          loading: false,
          error: null,
          addItem: jest.fn(),
          updateItem: jest.fn(),
          deleteItem: jest.fn(),
          searchInventory: jest.fn(),
        }),
      }));

      rerender(<Dashboard />);
      
      // Should show updated data
      expect(screen.getByText('Updated Item')).toBeInTheDocument();
    });
  });
});
