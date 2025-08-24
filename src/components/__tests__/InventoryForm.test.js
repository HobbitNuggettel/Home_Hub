import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InventoryForm from '../inventory/InventoryForm';
import { renderWithProviders } from '../../utils/test-utils';

// Mock data for testing
const mockItem = {
  id: 1,
  name: 'Test Item',
  category: 'Electronics',
  quantity: 2,
  price: 99.99,
  location: 'Office',
  addedDate: '2024-01-15',
  tags: ['test', 'electronics']
};

const defaultProps = {
  item: null,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  categories: ['Electronics', 'Kitchen', 'Furniture', 'Books', 'Clothing'],
  locations: ['Office', 'Kitchen', 'Living Room', 'Bedroom', 'Garage']
};

describe('InventoryForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering & Structure', () => {
    test('renders without crashing', () => {
      render(<InventoryForm {...defaultProps} />);
      expect(screen.getByTestId('inventory-form')).toBeInTheDocument();
    });

    test('displays form title for new item', () => {
      render(<InventoryForm {...defaultProps} />);
      expect(screen.getByText('Add New Item')).toBeInTheDocument();
    });

    test('displays form title for editing existing item', () => {
      render(<InventoryForm {...defaultProps} item={mockItem} />);
      expect(screen.getByText('Edit Item')).toBeInTheDocument();
    });

    test('renders all required form fields', () => {
      render(<InventoryForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date added/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      render(<InventoryForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Form Initialization', () => {
    test('initializes with empty values for new item', () => {
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      const priceInput = screen.getByLabelText(/price/i);
      
      expect(nameInput.value).toBe('');
      expect(quantityInput.value).toBe('1');
      expect(priceInput.value).toBe('0.00');
    });

    test('populates form with existing item data', () => {
      render(<InventoryForm {...defaultProps} item={mockItem} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const categorySelect = screen.getByLabelText(/category/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      const priceInput = screen.getByLabelText(/price/i);
      const locationSelect = screen.getByLabelText(/location/i);
      const tagsInput = screen.getByLabelText(/tags/i);
      
      expect(nameInput.value).toBe('Test Item');
      expect(categorySelect.value).toBe('Electronics');
      expect(quantityInput.value).toBe('2');
      expect(priceInput.value).toBe('99.99');
      expect(locationSelect.value).toBe('Office');
      expect(tagsInput.value).toBe('test, electronics');
    });

    test('sets current date as default for new items', () => {
      render(<InventoryForm {...defaultProps} />);
      
      const dateInput = screen.getByLabelText(/date added/i);
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });
  });

  describe('Form Validation', () => {
    test('shows error for empty name field', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    test('shows error for invalid quantity', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      
      await user.type(nameInput, 'Test Item');
      await user.clear(quantityInput);
      await user.type(quantityInput, '0');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Quantity must be at least 1')).toBeInTheDocument();
    });

    test('shows error for invalid price', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const priceInput = screen.getByLabelText(/price/i);
      
      await user.type(nameInput, 'Test Item');
      await user.clear(priceInput);
      await user.type(priceInput, '-10');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Price must be non-negative')).toBeInTheDocument();
    });

    test('shows error for empty category', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const categorySelect = screen.getByLabelText(/category/i);
      
      await user.type(nameInput, 'Test Item');
      await user.selectOptions(categorySelect, '');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Category is required')).toBeInTheDocument();
    });

    test('shows error for empty location', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const locationSelect = screen.getByLabelText(/location/i);
      
      await user.type(nameInput, 'Test Item');
      await user.selectOptions(locationSelect, '');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });

    test('validates multiple fields simultaneously', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Category is required')).toBeInTheDocument();
      expect(screen.getByText('Location is required')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls onSubmit with form data for new item', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      // Fill out the form
      const nameInput = screen.getByLabelText(/name/i);
      const categorySelect = screen.getByLabelText(/category/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      const priceInput = screen.getByLabelText(/price/i);
      const locationSelect = screen.getByLabelText(/location/i);
      const tagsInput = screen.getByLabelText(/tags/i);
      
      await user.type(nameInput, 'New Item');
      await user.selectOptions(categorySelect, 'Electronics');
      await user.clear(quantityInput);
      await user.type(quantityInput, '3');
      await user.clear(priceInput);
      await user.type(priceInput, '149.99');
      await user.selectOptions(locationSelect, 'Office');
      await user.type(tagsInput, 'new, electronics');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'New Item',
        category: 'Electronics',
        quantity: 3,
        price: 149.99,
        location: 'Office',
        addedDate: expect.any(String),
        tags: ['new', 'electronics']
      });
    });

    test('calls onSubmit with updated data for existing item', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} item={mockItem} />);
      
      // Update the form
      const nameInput = screen.getByLabelText(/name/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Item');
      await user.clear(quantityInput);
      await user.type(quantityInput, '5');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        ...mockItem,
        name: 'Updated Item',
        quantity: 5
      });
    });

    test('prevents submission when form is invalid', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    test('handles decimal quantities correctly', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      
      await user.type(nameInput, 'Test Item');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2.5');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 2.5
        })
      );
    });
  });

  describe('Form Interactions', () => {
    test('handles input changes correctly', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test Item');
      
      expect(nameInput.value).toBe('Test Item');
    });

    test('handles select changes correctly', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, 'Kitchen');
      
      expect(categorySelect.value).toBe('Kitchen');
    });

    test('handles number input changes correctly', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.clear(quantityInput);
      await user.type(quantityInput, '10');
      
      expect(quantityInput.value).toBe('10');
    });

    test('handles price input with currency formatting', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const priceInput = screen.getByLabelText(/price/i);
      await user.clear(priceInput);
      await user.type(priceInput, '199.99');
      
      expect(priceInput.value).toBe('199.99');
    });

    test('handles tags input with comma separation', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const tagsInput = screen.getByLabelText(/tags/i);
      await user.type(tagsInput, 'tag1, tag2, tag3');
      
      expect(tagsInput.value).toBe('tag1, tag2, tag3');
    });
  });

  describe('Cancel Functionality', () => {
    test('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('calls onCancel when cancel button is clicked with unsaved changes', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      // Make some changes
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test Item');
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<InventoryForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date added/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    test('has proper button roles', () => {
      render(<InventoryForm {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    test('has proper form role', () => {
      render(<InventoryForm {...defaultProps} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('has proper fieldset and legend', () => {
      render(<InventoryForm {...defaultProps} />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive grid classes', () => {
      render(<InventoryForm {...defaultProps} />);
      const form = screen.getByTestId('inventory-form');
      expect(form).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
    });

    test('applies responsive spacing classes', () => {
      render(<InventoryForm {...defaultProps} />);
      const form = screen.getByTestId('inventory-form');
      expect(form).toHaveClass('p-4', 'sm:p-6', 'lg:p-8');
    });
  });

  describe('Error Handling', () => {
    test('handles invalid input gracefully', async () => {
      const user = userEvent.setup();
      render(<InventoryForm {...defaultProps} />);
      
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.clear(quantityInput);
      await user.type(quantityInput, 'invalid');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(screen.getByText('Quantity must be at least 1')).toBeInTheDocument();
    });

    test('handles missing props gracefully', () => {
      render(<InventoryForm />);
      expect(screen.getByTestId('inventory-form')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('works with ThemeContext provider', () => {
      renderWithProviders(<InventoryForm {...defaultProps} />);
      expect(screen.getByTestId('inventory-form')).toBeInTheDocument();
    });

    test('handles callback functions correctly', async () => {
      const user = userEvent.setup();
      const mockCallbacks = {
        onSubmit: jest.fn(),
        onCancel: jest.fn()
      };

      render(<InventoryForm {...defaultProps} {...mockCallbacks} />);
      
      // Test submit callback
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'Test Item');
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      expect(mockCallbacks.onSubmit).toHaveBeenCalled();

      // Test cancel callback
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      expect(mockCallbacks.onCancel).toHaveBeenCalled();
    });
  });
});
