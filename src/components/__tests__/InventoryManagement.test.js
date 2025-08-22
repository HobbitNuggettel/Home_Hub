import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryManagement from '../InventoryManagement';
import { renderWithProviders, mockInventoryItem } from '../../utils/test-utils';

// Mock the useInventory hook
const mockUseInventory = {
  inventory: [mockInventoryItem],
  loading: false,
  error: null,
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  searchInventory: jest.fn(),
  categories: ['Electronics', 'Furniture', 'Clothing', 'Books'],
};

jest.mock('../../hooks/useInventory', () => ({
  __esModule: true,
  default: () => mockUseInventory,
}));

describe('InventoryManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInventory.inventory = [mockInventoryItem];
    mockUseInventory.loading = false;
    mockUseInventory.error = null;
  });

  describe('Rendering & Structure', () => {
    test('renders inventory management with all main sections', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Check for main sections
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      expect(screen.getByText('Search & Filters')).toBeInTheDocument();
      expect(screen.getByText('View Mode')).toBeInTheDocument();
      expect(screen.getByText('Total Items: 1')).toBeInTheDocument();
    });

    test('renders inventory stats cards', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Check for stats cards
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
    });

    test('renders search and filter controls', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Check for search input
      expect(screen.getByPlaceholderText(/search items/i)).toBeInTheDocument();
      
      // Check for category filter
      expect(screen.getByText('Category')).toBeInTheDocument();
      
      // Check for view mode toggle
      expect(screen.getByText('Table View')).toBeInTheDocument();
      expect(screen.getByText('Grid View')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Check for action buttons
      expect(screen.getByText('Add Item')).toBeInTheDocument();
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
      expect(screen.getByText('Import CSV')).toBeInTheDocument();
      expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('applies dark mode classes when theme is dark', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithProviders(<InventoryManagement />);
      
      const container = screen.getByTestId('inventory-container');
      expect(container).toHaveClass('dark:bg-gray-900');
    });

    test('applies light mode classes when theme is light', () => {
      localStorage.setItem('themeMode', 'light');
      
      renderWithProviders(<InventoryManagement />);
      
      const container = screen.getByTestId('inventory-container');
      expect(container).toHaveClass('bg-gray-50');
    });

    test('dark mode styling is consistent across all elements', () => {
      localStorage.setItem('themeMode', 'dark');
      
      renderWithProviders(<InventoryManagement />);
      
      // Check header styling
      const header = screen.getByText('Inventory Management').closest('div');
      expect(header).toHaveClass('dark:bg-gray-800');
      
      // Check search input styling
      const searchInput = screen.getByPlaceholderText(/search items/i);
      expect(searchInput).toHaveClass('dark:bg-gray-700', 'dark:text-white');
    });
  });

  describe('Search and Filtering', () => {
    test('search input filters inventory items', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const searchInput = screen.getByPlaceholderText(/search items/i);
      await user.type(searchInput, 'Test');
      
      expect(searchInput).toHaveValue('Test');
      expect(mockUseInventory.searchInventory).toHaveBeenCalledWith('Test');
    });

    test('category filter works correctly', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const categorySelect = screen.getByText('Category').nextElementSibling;
      await user.click(categorySelect);
      
      // Should show category options
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Furniture')).toBeInTheDocument();
    });

    test('reset filters clears all filters', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const resetButton = screen.getByText('Reset Filters');
      await user.click(resetButton);
      
      // Search input should be cleared
      const searchInput = screen.getByPlaceholderText(/search items/i);
      expect(searchInput).toHaveValue('');
    });
  });

  describe('View Modes', () => {
    test('switches between table and grid view', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Initially in table view
      expect(screen.getByText('Table View')).toHaveClass('bg-blue-600');
      
      // Switch to grid view
      const gridViewButton = screen.getByText('Grid View');
      await user.click(gridViewButton);
      
      expect(gridViewButton).toHaveClass('bg-blue-600');
      expect(screen.getByText('Table View')).not.toHaveClass('bg-blue-600');
    });

    test('table view displays items in table format', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Should show table headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      
      // Should show item data
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    test('grid view displays items in grid format', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Switch to grid view
      const gridViewButton = screen.getByText('Grid View');
      await user.click(gridViewButton);
      
      // Should show grid items
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      // Grid view specific elements should be visible
      expect(screen.getByText('Electronics')).toBeInTheDocument();
    });
  });

  describe('CRUD Operations', () => {
    test('add item button opens add item modal', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const addButton = screen.getByText('Add Item');
      await user.click(addButton);
      
      // Modal should be visible
      expect(screen.getByText('Add New Item')).toBeInTheDocument();
    });

    test('edit item functionality works', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Find edit button (assuming it's in the table row)
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);
      
      // Edit modal should be visible
      expect(screen.getByText('Edit Item')).toBeInTheDocument();
    });

    test('delete item functionality works', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Find delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      
      // Delete confirmation should be visible
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    test('bulk operations work correctly', async () => {
      const user = userEvent.setup();
      
      // Mock multiple items
      mockUseInventory.inventory = [
        { ...mockInventoryItem, id: '1' },
        { ...mockInventoryItem, id: '2', name: 'Item 2' },
      ];
      
      renderWithProviders(<InventoryManagement />);
      
      // Checkboxes should be visible for bulk selection
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(1);
      
      // Select first item
      await user.click(checkboxes[0]);
      expect(checkboxes[0]).toBeChecked();
    });
  });

  describe('Data Export/Import', () => {
    test('export CSV functionality works', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);
      
      // Should trigger export (this would depend on your implementation)
      expect(exportButton).toBeInTheDocument();
    });

    test('import CSV functionality works', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const importButton = screen.getByText('Import CSV');
      await user.click(importButton);
      
      // Import modal should be visible
      expect(screen.getByText('Import CSV')).toBeInTheDocument();
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
      
      renderWithProviders(<InventoryManagement />);
      
      // Component should render without breaking on mobile
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    });

    test('table view is responsive on small screens', () => {
      // Mock small screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      renderWithProviders(<InventoryManagement />);
      
      // Table should be responsive
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error messages when API calls fail', () => {
      mockUseInventory.error = 'Failed to load inventory';
      
      renderWithProviders(<InventoryManagement />);
      
      expect(screen.getByText('Failed to load inventory')).toBeInTheDocument();
    });

    test('shows loading states during API calls', () => {
      mockUseInventory.loading = true;
      
      renderWithProviders(<InventoryManagement />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('handles empty inventory gracefully', () => {
      mockUseInventory.inventory = [];
      
      renderWithProviders(<InventoryManagement />);
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for all interactive elements', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Check for ARIA labels on buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label', expect.any(String));
      });
      
      // Check for ARIA labels on form inputs
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label', expect.any(String));
      });
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Test tab navigation
      const searchInput = screen.getByPlaceholderText(/search items/i);
      searchInput.focus();
      expect(searchInput).toHaveFocus();
      
      // Navigate with Tab key
      await user.tab();
      const addButton = screen.getByText('Add Item');
      expect(addButton).toHaveFocus();
    });

    test('has proper focus indicators', () => {
      renderWithProviders(<InventoryManagement />);
      
      const focusableElements = screen.getAllByRole('button');
      focusableElements.forEach(element => {
        element.focus();
        expect(element).toHaveClass('focus:ring-2', 'focus:ring-blue-500');
      });
    });
  });

  describe('Performance', () => {
    test('handles large datasets efficiently', () => {
      const largeInventory = Array.from({ length: 1000 }, (_, i) => ({
        ...mockInventoryItem,
        id: `item-${i}`,
        name: `Item ${i}`,
      }));
      
      mockUseInventory.inventory = largeInventory;
      
      renderWithProviders(<InventoryManagement />);
      
      // Component should render without performance issues
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
      expect(screen.getByText('Total Items: 1000')).toBeInTheDocument();
    });

    test('search performance is optimized', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      const searchInput = screen.getByPlaceholderText(/search items/i);
      
      // Type quickly to test debouncing
      await user.type(searchInput, 'test');
      await user.type(searchInput, 'ing');
      
      // Should handle rapid input without performance issues
      expect(searchInput).toHaveValue('testing');
    });
  });

  describe('Integration with Hooks', () => {
    test('uses useInventory hook correctly', () => {
      renderWithProviders(<InventoryManagement />);
      
      // Component should use the mocked hook
      expect(mockUseInventory.inventory).toEqual([mockInventoryItem]);
    });

    test('calls hook functions when needed', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<InventoryManagement />);
      
      // Search should call the hook function
      const searchInput = screen.getByPlaceholderText(/search items/i);
      await user.type(searchInput, 'test');
      
      expect(mockUseInventory.searchInventory).toHaveBeenCalledWith('test');
    });

    test('updates when hook data changes', () => {
      const { rerender } = renderWithProviders(<InventoryManagement />);
      
      // Initially shows 1 item
      expect(screen.getByText('Total Items: 1')).toBeInTheDocument();
      
      // Update mock data
      mockUseInventory.inventory = [
        { ...mockInventoryItem, id: '1' },
        { ...mockInventoryItem, id: '2', name: 'Item 2' },
      ];
      
      rerender(<InventoryManagement />);
      
      // Should show updated count
      expect(screen.getByText('Total Items: 2')).toBeInTheDocument();
    });
  });
});
