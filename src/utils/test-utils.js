import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock AuthContext to avoid Firebase dependencies in tests
const MockAuthProvider = ({ children }) => children;

// Custom render function that includes all necessary providers
const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <MockAuthProvider>
          {children}
        </MockAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Custom render function for components that need all providers
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Custom render function for components that only need routing
export const renderWithRouter = (ui, options = {}) => {
  return render(ui, { wrapper: BrowserRouter, ...options });
};

// Custom render function for components that only need theme context
export const renderWithTheme = (ui, options = {}) => {
  return render(ui, { wrapper: ThemeProvider, ...options });
};

// Mock data for testing
export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

export const mockInventoryItem = {
  id: 'item-1',
  name: 'Test Item',
  category: 'Electronics',
  quantity: 1,
  value: 99.99,
  location: 'Living Room',
  notes: 'Test notes',
  tags: ['test', 'electronics'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSpendingItem = {
  id: 'expense-1',
  description: 'Test Expense',
  amount: 50.00,
  category: 'Food',
  date: new Date().toISOString(),
  paymentMethod: 'Credit Card',
  recurring: false,
  notes: 'Test expense notes',
};

export const mockHousehold = {
  id: 'household-1',
  name: 'Test Household',
  members: [mockUser],
  owner: mockUser.uid,
  createdAt: new Date().toISOString(),
};

// Helper function to wait for async operations
export const waitForElementToBeRemoved = (element) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

// Helper function to simulate theme changes
export const simulateThemeChange = (theme) => {
  const event = new CustomEvent('themeChange', { detail: { theme } });
  window.dispatchEvent(event);
};

// Helper function to simulate localStorage changes
export const simulateLocalStorageChange = (key, value) => {
  const event = new StorageEvent('storage', {
    key,
    newValue: value,
    oldValue: localStorage.getItem(key),
    storageArea: localStorage,
  });
  window.dispatchEvent(event);
};
