import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { DevToolsProvider } from '../contexts/DevToolsContext';
import { AuthProvider } from '../contexts/AuthContext';

// Mock AuthContext for tests
const mockAuthContext = {
  currentUser: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
  userProfile: { name: 'Test User', email: 'test@example.com' },
  updateUserProfile: jest.fn(() => Promise.resolve()),
  login: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
  logout: jest.fn(() => Promise.resolve()),
  loading: false,
  error: null,
};

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(() => mockAuthContext),
  AuthProvider: ({ children }) => children,
}));

// Mock RealTimeContext for tests
jest.mock('../contexts/RealTimeContext', () => ({
  useRealTime: jest.fn(() => ({
    isConnected: true,
    connectionStatus: 'connected',
    subscribe: jest.fn(() => jest.fn()),
    stats: { totalListeners: 0, activeConnections: 1 },
  })),
  RealTimeProvider: ({ children }) => children,
}));

// Mock DevToolsContext for tests
jest.mock('../contexts/DevToolsContext', () => ({
  useDevTools: jest.fn(() => ({
    isDevMode: false,
    toggleDevMode: jest.fn(),
    showDevTools: false,
    toggleDevTools: jest.fn(),
  })),
  DevToolsProvider: ({ children }) => children,
}));

// Mock AuthContext to avoid Firebase dependencies in tests
const MockAuthProvider = ({ children }) => children;

// Mock useInventory hook
export const mockUseInventory = {
  items: [],
  categories: [],
  selectedItems: [],
  filteredItems: [],
  viewMode: 'table',
  statistics: {
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    categories: {}
  },
  actions: {
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
    bulkDelete: jest.fn(),
    searchItems: jest.fn(),
    filterByCategory: jest.fn(),
    exportCSV: jest.fn(),
    importCSV: jest.fn(),
    setViewMode: jest.fn(),
    selectItem: jest.fn(),
    selectAll: jest.fn(),
    clearSelection: jest.fn(),
    setShowAddForm: jest.fn(),
    setShowMultiAddForm: jest.fn(),
    setEditingItem: jest.fn(),
    setShowDeleteConfirm: jest.fn(),
    setShowImportForm: jest.fn(),
    setShowExportForm: jest.fn(),
    setSearchTerm: jest.fn(),
    setSelectedCategory: jest.fn(),
    setSortBy: jest.fn(),
    setSortOrder: jest.fn()
  },
  loading: false,
  error: null,
  showAddForm: false,
  showMultiAddForm: false,
  editingItem: null,
  showDeleteConfirm: false,
  showImportForm: false,
  showExportForm: false,
  searchTerm: '',
  selectedCategory: '',
  sortBy: 'name',
  sortOrder: 'asc'
};

// Mock the useInventory hook function
export const useInventory = jest.fn(() => mockUseInventory);

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

// Custom render function for Home component that needs DevToolsContext and Router
export const renderHomeWithProviders = (ui, options = {}) => {
  const HomeWrapper = ({ children }) => (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <DevToolsProvider>
          {children}
        </DevToolsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
  return render(ui, { wrapper: HomeWrapper, ...options });
};

// Custom render function for components that only need routing
export const renderWithRouter = (ui, options = {}) => {
  const RouterWrapper = ({ children }) => (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {children}
    </BrowserRouter>
  );
  return render(ui, { wrapper: RouterWrapper, ...options });
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
    oldValue: null,
    url: window.location.href
  });
  window.dispatchEvent(event);
};

// Helper function to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  useInventory.mockClear();
  Object.values(mockUseInventory.actions).forEach(action => action.mockClear());
};

// Helper function to set mock data
export const setMockInventoryData = (items = [], categories = []) => {
  mockUseInventory.items = items;
  mockUseInventory.categories = categories;
  mockUseInventory.filteredItems = items;
  mockUseInventory.selectedItems = [];
  mockUseInventory.statistics = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.value || 0), 0),
    lowStockItems: items.filter(item => (item.quantity || 0) <= 2).length,
    categories: categories.reduce((acc, cat) => {
      acc[cat] = items.filter(item => item.category === cat).length;
      return acc;
    }, {})
  };
};
