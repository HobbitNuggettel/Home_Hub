import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryList from '../inventory/InventoryList.js';
import { renderWithProviders } from '../../utils/test-utils.js';

// Mock data for testing
const mockItems = [
  {
    id: 1,
    name: 'Laptop',
    category: 'Electronics',
    quantity: 2,
    price: 999.99,
    location: 'Office',
    addedDate: '2024-01-15',
    tags: ['work', 'computer']
  },
  {
    id: 2,
    name: 'Coffee Maker',
    category: 'Kitchen',
    quantity: 1,
    price: 89.99,
    location: 'Kitchen',
    addedDate: '2024-01-10',
    tags: ['appliance', 'daily']
  },
  {
    id: 3,
    name: 'Bookshelf',
    category: 'Furniture',
    quantity: 1,
    price: 149.99,
    location: 'Living Room',
    addedDate: '2024-01-05',
    tags: ['storage', 'decor']
  }
];

const mockSelectedItems = [1];

const defaultProps = {
  items: mockItems,
  selectedItems: mockSelectedItems,
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onView: jest.fn(),
  onToggleSelection: jest.fn(),
  viewMode: 'grid'
};

describe('InventoryList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    test('renders without crashing', () => {
      render(<InventoryList {...defaultProps} />);
      expect(screen.getByTestId('inventory-list')).toBeInTheDocument();
    });

    test('displays correct number of items', () => {
      render(<InventoryList {...defaultProps} />);
      const itemElements = screen.getAllByTestId('inventory-item');
      expect(itemElements).toHaveLength(3);
    });

    test('renders grid view by default', () => {
      render(<InventoryList {...defaultProps} />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('grid');
    });

    test('renders list view when specified', () => {
      render(<InventoryList {...defaultProps} viewMode="list" />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('space-y-2');
    });

    test('displays empty state when no items', () => {
      render(<InventoryList {...defaultProps} items={[]} />);
      expect(screen.getByText('No inventory items found')).toBeInTheDocument();
    });
  });

  describe('Item Display', () => {
    test('displays item name correctly', () => {
      render(<InventoryList {...defaultProps} />);
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Coffee Maker')).toBeInTheDocument();
      expect(screen.getByText('Bookshelf')).toBeInTheDocument();
    });

    test('displays item category correctly', () => {
      render(<InventoryList {...defaultProps} />);
      // Check category labels exist (multiple instances expected)
      const categoryLabels = screen.getAllByText('Category:');
      expect(categoryLabels.length).toBeGreaterThan(0);
      
      // Check specific categories exist
      const electronicsElements = screen.getAllByText('Electronics');
      const kitchenElements = screen.getAllByText('Kitchen');
      expect(electronicsElements.length).toBeGreaterThan(0);
      expect(kitchenElements.length).toBeGreaterThan(0);
    });

    test('displays item quantity correctly', () => {
      render(<InventoryList {...defaultProps} />);
      // Check quantity labels exist (multiple instances expected)
      const quantityLabels = screen.getAllByText('Quantity:');
      expect(quantityLabels.length).toBeGreaterThan(0);
      
      // Check specific quantities exist (using getAllByText for multiple instances)
      const twoElements = screen.getAllByText('2');
      const oneElements = screen.getAllByText('1');
      expect(twoElements.length).toBeGreaterThan(0);
      expect(oneElements.length).toBeGreaterThan(0);
    });

    test('displays item price correctly', () => {
      render(<InventoryList {...defaultProps} />);
      expect(screen.getByText('$999.99')).toBeInTheDocument();
      expect(screen.getByText('$89.99')).toBeInTheDocument();
      expect(screen.getByText('$149.99')).toBeInTheDocument();
    });

    test('displays item location correctly', () => {
      render(<InventoryList {...defaultProps} />);
      // Check location elements exist (multiple instances expected)
      const officeElements = screen.getAllByText('Office');
      const kitchenElements = screen.getAllByText('Kitchen');
      const livingRoomElements = screen.getAllByText('Living Room');
      
      expect(officeElements.length).toBeGreaterThan(0);
      expect(kitchenElements.length).toBeGreaterThan(0);
      expect(livingRoomElements.length).toBeGreaterThan(0);
    });

    test('displays item tags correctly', () => {
      render(<InventoryList {...defaultProps} />);
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('computer')).toBeInTheDocument();
      expect(screen.getByText('appliance')).toBeInTheDocument();
      expect(screen.getByText('daily')).toBeInTheDocument();
    });
  });

  describe('Selection Functionality', () => {
    test('displays checkboxes for item selection', () => {
      render(<InventoryList {...defaultProps} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    test('marks items as selected correctly', () => {
      render(<InventoryList {...defaultProps} />);
      const laptopCheckbox = screen.getByLabelText('Select Laptop');
      expect(laptopCheckbox).toBeChecked();
    });

    test('calls onToggleSelection when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryList {...defaultProps} />);
      
      const coffeeMakerCheckbox = screen.getByLabelText('Select Coffee Maker');
      await user.click(coffeeMakerCheckbox);
      
      expect(defaultProps.onToggleSelection).toHaveBeenCalledWith(2);
    });

    test('handles multiple item selection', async () => {
      const user = userEvent.setup();
      render(<InventoryList {...defaultProps} selectedItems={[1, 2]} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked(); // Laptop
      expect(checkboxes[1]).toBeChecked(); // Coffee Maker
      expect(checkboxes[2]).not.toBeChecked(); // Bookshelf
    });
  });

  describe('Action Buttons', () => {
    test('displays edit button for each item', () => {
      render(<InventoryList {...defaultProps} />);
      const editButtons = screen.getAllByLabelText(/edit/i);
      expect(editButtons).toHaveLength(3);
    });

    test('displays delete button for each item', () => {
      render(<InventoryList {...defaultProps} />);
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      expect(deleteButtons).toHaveLength(3);
    });

    test('displays view button for each item', () => {
      render(<InventoryList {...defaultProps} />);
      const viewButtons = screen.getAllByLabelText(/view/i);
      expect(viewButtons).toHaveLength(3);
    });

    test('calls onEdit when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryList {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText(/edit/i);
      await user.click(editButtons[0]); // Click edit for Laptop
      
      expect(defaultProps.onEdit).toHaveBeenCalledWith(1);
    });

    test('calls onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryList {...defaultProps} />);
      
      const deleteButtons = screen.getAllByLabelText(/delete/i);
      await user.click(deleteButtons[0]); // Click delete for Laptop
      
      expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
    });

    test('calls onView when view button is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryList {...defaultProps} />);
      
      const viewButtons = screen.getAllByLabelText(/view/i);
      await user.click(viewButtons[0]); // Click view for Laptop
      
      expect(defaultProps.onView).toHaveBeenCalledWith(1);
    });
  });

  describe('View Mode Switching', () => {
    test('switches between grid and list view', () => {
      const { rerender } = render(<InventoryList {...defaultProps} viewMode="grid" />);
      
      let listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('grid');
      
      rerender(<InventoryList {...defaultProps} viewMode="list" />);
      listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('space-y-2');
    });

    test('applies correct styling for grid view', () => {
      render(<InventoryList {...defaultProps} viewMode="grid" />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
    });

    test('applies correct styling for list view', () => {
      render(<InventoryList {...defaultProps} viewMode="list" />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('space-y-2');
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive grid classes', () => {
      render(<InventoryList {...defaultProps} viewMode="grid" />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    test('applies responsive padding classes', () => {
      render(<InventoryList {...defaultProps} />);
      const listContainer = screen.getByTestId('inventory-list');
      expect(listContainer).toHaveClass('p-4', 'sm:p-6', 'lg:p-8');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels for action buttons', () => {
      render(<InventoryList {...defaultProps} />);
      
      expect(screen.getByLabelText('Edit Laptop')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete Laptop')).toBeInTheDocument();
      expect(screen.getByLabelText('View Laptop')).toBeInTheDocument();
    });

    test('has proper ARIA labels for checkboxes', () => {
      render(<InventoryList {...defaultProps} />);
      
      expect(screen.getByLabelText('Select Laptop')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Coffee Maker')).toBeInTheDocument();
      expect(screen.getByLabelText('Select Bookshelf')).toBeInTheDocument();
    });

    test('checkboxes have proper roles', () => {
      render(<InventoryList {...defaultProps} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    test('buttons have proper roles', () => {
      render(<InventoryList {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('handles missing item properties gracefully', () => {
      const incompleteItems = [
        { id: 1, name: 'Incomplete Item' }
      ];
      
      render(<InventoryList {...defaultProps} items={incompleteItems} />);
      expect(screen.getByText('Incomplete Item')).toBeInTheDocument();
    });

    test('handles null or undefined items gracefully', () => {
      render(<InventoryList {...defaultProps} items={null} />);
      expect(screen.getByText('No inventory items found')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders large lists efficiently', () => {
      const largeItemList = Array.from({ length: 100 }, (_, index) => ({
        id: index + 1,
        name: `Item ${index + 1}`,
        category: 'Test',
        quantity: 1,
        price: 10.00,
        location: 'Test Location',
        addedDate: '2024-01-01',
        tags: ['test']
      }));

      const startTime = performance.now();
      render(<InventoryList {...defaultProps} items={largeItemList} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should render in under 1 second
      expect(screen.getAllByTestId('inventory-item')).toHaveLength(100);
    });
  });

  describe('Integration', () => {
    test('works with ThemeContext provider', () => {
      renderWithProviders(<InventoryList {...defaultProps} />);
      expect(screen.getByTestId('inventory-list')).toBeInTheDocument();
    });

    test('handles callback functions correctly', async () => {
      const user = userEvent.setup();
      const mockCallbacks = {
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onView: jest.fn(),
        onToggleSelection: jest.fn()
      };

      render(<InventoryList {...defaultProps} {...mockCallbacks} />);
      
      // Test edit callback
      const editButton = screen.getByLabelText('Edit Laptop');
      await user.click(editButton);
      expect(mockCallbacks.onEdit).toHaveBeenCalledWith(1);

      // Test delete callback
      const deleteButton = screen.getByLabelText('Delete Laptop');
      await user.click(deleteButton);
      expect(mockCallbacks.onDelete).toHaveBeenCalledWith(1);

      // Test view callback
      const viewButton = screen.getByLabelText('View Laptop');
      await user.click(viewButton);
      expect(mockCallbacks.onView).toHaveBeenCalledWith(1);

      // Test selection callback
      const checkbox = screen.getByLabelText('Select Laptop');
      await user.click(checkbox);
      expect(mockCallbacks.onToggleSelection).toHaveBeenCalledWith(1);
    });
  });
});
