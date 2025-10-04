import React, { useEffect, useCallback, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Barcode, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  ShoppingCart,
  AlertTriangle,
  Upload,
  Download,
  FileText,
  Users,
  Calendar,
  MapPin,
  Brain,
  Lightbulb,
  Zap,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeScanner from './BarcodeScanner';
import { useInventory } from '../hooks/useInventory';
import AIInventoryService from '../services/AIInventoryService';
import { useAuth } from '../contexts/AuthContext';
import hybridStorage from '../firebase/hybridStorage';

// Mock inventory data
const mockCategories = [
  'Electronics', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Office', 'Garden', 'Clothing', 'Books', 'Tools', 'Food'
];

const mockItems = [
  {
    id: '1',
    name: 'Coffee Maker',
    category: 'Kitchen',
    quantity: 1,
    location: 'Kitchen Counter',
    purchaseDate: '2024-01-15',
    expiryDate: null,
    price: 89.99,
    barcode: '1234567890123',
    notes: 'Automatic drip coffee maker',
    status: 'active',
    warranty: '2 years',
    supplier: 'Best Buy',
    tags: ['appliance', 'kitchen', 'coffee']
  },
  {
    id: '2',
    name: 'Laptop',
    category: 'Electronics',
    quantity: 1,
    location: 'Home Office',
    purchaseDate: '2023-12-01',
    expiryDate: null,
    price: 1299.99,
    barcode: '9876543210987',
    notes: 'MacBook Pro 14"',
    status: 'active',
    warranty: '1 year',
    supplier: 'Apple Store',
    tags: ['computer', 'work', 'electronics']
  },
  {
    id: '3',
    name: 'Toothpaste',
    category: 'Bathroom',
    quantity: 2,
    location: 'Bathroom Cabinet',
    purchaseDate: '2024-01-10',
    expiryDate: '2025-01-10',
    price: 4.99,
    barcode: '4567891234567',
    notes: 'Colgate Total',
    status: 'active',
    warranty: null,
    supplier: 'Walmart',
    tags: ['hygiene', 'bathroom', 'consumable']
  },
  // Enhanced mock data matching AI Assistant responses
  {
    id: '4',
    name: 'Milk',
    category: 'Food',
    quantity: 1,
    location: 'Refrigerator',
    purchaseDate: '2024-01-20',
    expiryDate: '2024-01-22',
    price: 3.99,
    barcode: '7891234567890',
    notes: '2% milk - running low',
    status: 'low',
    warranty: null,
    supplier: 'Walmart',
    tags: ['dairy', 'refrigerated', 'essential']
  },
  {
    id: '5',
    name: 'Bread',
    category: 'Food',
    quantity: 1,
    location: 'Kitchen Counter',
    purchaseDate: '2024-01-19',
    expiryDate: '2024-01-22',
    price: 2.49,
    barcode: '3210987654321',
    notes: 'Whole wheat bread - last loaf',
    status: 'low',
    warranty: null,
    supplier: 'Target',
    tags: ['bakery', 'essential', 'breakfast']
  },
  {
    id: '6',
    name: 'Eggs',
    category: 'Food',
    quantity: 4,
    location: 'Refrigerator',
    purchaseDate: '2024-01-18',
    expiryDate: '2024-01-23',
    price: 4.99,
    barcode: '6543210987654',
    notes: 'Free range eggs - 4 remaining',
    status: 'low',
    warranty: null,
    supplier: 'Whole Foods',
    tags: ['dairy', 'protein', 'essential']
  },
  {
    id: '7',
    name: 'Spaghettini',
    category: 'Food',
    quantity: 3,
    location: 'Pantry',
    purchaseDate: '2024-01-01',
    expiryDate: '2025-12-31',
    price: 2.99,
    barcode: '1357924680135',
    notes: 'Thin spaghetti - 3 boxes available',
    status: 'active',
    warranty: null,
    supplier: 'Walmart',
    tags: ['pasta', 'pantry', 'cooking']
  },
  {
    id: '8',
    name: 'Canned Tomatoes',
    category: 'Food',
    quantity: 8,
    location: 'Pantry',
    purchaseDate: '2024-01-01',
    expiryDate: '2026-12-31',
    price: 1.49,
    barcode: '2468135790246',
    notes: 'Crushed tomatoes - 8 cans',
    status: 'active',
    warranty: null,
    supplier: 'Target',
    tags: ['canned', 'pantry', 'cooking']
  },
  {
    id: '9',
    name: 'Olive Oil',
    category: 'Food',
    quantity: 2,
    location: 'Pantry',
    purchaseDate: '2024-01-01',
    expiryDate: '2026-12-31',
    price: 8.99,
    barcode: '3692581470369',
    notes: 'Extra virgin olive oil - 2 bottles',
    status: 'active',
    warranty: null,
    supplier: 'Whole Foods',
    tags: ['oil', 'pantry', 'cooking']
  },
  {
    id: '10',
    name: 'Garlic',
    category: 'Food',
    quantity: 2,
    location: 'Kitchen Counter',
    purchaseDate: '2024-01-15',
    expiryDate: '2024-01-29',
    price: 1.99,
    barcode: '1472583690147',
    notes: 'Fresh garlic heads - 2 remaining',
    status: 'active',
    warranty: null,
    supplier: 'Local Market',
    tags: ['vegetable', 'fresh', 'cooking']
  }
];

function InventoryManagement() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load inventory data from Firebase
  useEffect(() => {
    const loadInventoryData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [itemsResponse, categoriesResponse] = await Promise.all([
          hybridStorage.getInventoryItems(currentUser.uid),
          hybridStorage.getInventoryCategories(currentUser.uid)
        ]);

        if (itemsResponse.success) {
          setInventoryItems(itemsResponse.data || []);
        } else {
          console.error('Failed to load inventory items:', itemsResponse.error);
          setInventoryItems([]);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setInventoryCategories(Object.keys(categoriesResponse.data));
        } else {
          // Fallback to default categories
          setInventoryCategories(['Electronics', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Office', 'Garden', 'Clothing', 'Books', 'Tools', 'Food']);
        }
      } catch (error) {
        console.error('Error loading inventory data:', error);
        setInventoryItems([]);
        setInventoryCategories(['Electronics', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Office', 'Garden', 'Clothing', 'Books', 'Tools', 'Food']);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventoryData();
  }, [currentUser]);

  const {
    items,
    categories,
    searchTerm,
    selectedCategory,
    showAddForm,
    showMultiAddForm,
    editingItem,
    showBarcodeScanner,
    viewMode,
    selectedItems,
    filteredItems,
    statistics,
    actions
  } = useInventory(inventoryItems, inventoryCategories);

  // AI Features State
  const [aiPredictions, setAiPredictions] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Load AI insights and predictions
  const loadAIInsights = useCallback(async () => {
    if (items.length === 0) return;

    setIsLoadingAI(true);
    try {
      const [predictions, suggestions, alerts] = await Promise.all([
        AIInventoryService.predictInventoryNeeds(items),
        AIInventoryService.generateOrganizationSuggestions(items),
        AIInventoryService.generateInventoryAlerts(items)
      ]);

      setAiPredictions(predictions);
      setAiSuggestions(suggestions);
      setAiAlerts(alerts);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  }, [items]);

  // Load AI insights on component mount and when items change
  useEffect(() => {
    loadAIInsights();
  }, [loadAIInsights]);

  // Add new item
  const addItem = useCallback((itemData) => {
    const newItem = {
      ...itemData,
      status: 'active',
      tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : []
    };
    actions.addItem(newItem);
    actions.setShowAddForm(false);
    toast.success('Item added successfully!');
  }, [actions]);

  // Add multiple items
  const addMultipleItems = useCallback((itemsData) => {
    const newItems = itemsData.map((itemData, index) => ({
      ...itemData,
      status: 'active',
      tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : []
    }));
    newItems.forEach(item => actions.addItem(item));
    actions.setShowMultiAddForm(false);
    toast.success(`${newItems.length} items added successfully!`);
  }, [actions]);

  // Update existing item
  const updateItem = useCallback((id, updates) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const updatedItem = { 
        ...item, 
        ...updates,
        tags: updates.tags ? updates.tags.split(',').map(tag => tag.trim()) : item.tags
      };
      actions.updateItem(updatedItem);
    }
    actions.setEditingItem(null);
    toast.success('Item updated successfully!');
  }, [items, actions]);

  // Delete item
  const deleteItem = useCallback((id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Are you sure you want to delete this item?')) {
      actions.deleteItem(id);
      toast.success('Item deleted successfully!');
    }
  }, [actions]);

  // Delete multiple items
  const deleteMultipleItems = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    // eslint-disable-next-line no-alert
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      actions.deleteMultiple(selectedItems);
      toast.success(`${selectedItems.length} items deleted successfully!`);
    }
  }, [selectedItems, actions]);

  // Export inventory to CSV
  const exportToCSV = useCallback(() => {
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Location', 'Price', 'Purchase Date', 'Expiry Date', 'Notes', 'Tags'],
      ...items.map(item => [
        item.name,
        item.category,
        item.quantity,
        item.location,
        item.price,
        item.purchaseDate,
        item.expiryDate || '',
        item.notes,
        item.tags.join(', ')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Inventory exported to CSV!');
  }, [items]);

  // Import inventory from CSV (simulated)
  const importFromCSV = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Simulate CSV import
        toast.success(`CSV file "${file.name}" imported successfully!`);
      }
    };
    input.click();
  }, []);

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId) => {
    actions.toggleItemSelection(itemId);
  }, [actions]);

  // Select all items
  const selectAllItems = useCallback(() => {
    if (selectedItems.length === filteredItems.length) {
      actions.deselectAll();
    } else {
      actions.selectAll();
    }
  }, [selectedItems.length, filteredItems.length, actions]);

  // AI Insights Panel Component
  const AIInsightsPanel = () => (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Inventory Insights & Smart Predictions
        </h3>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
        >
          {showAIPanel ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {isLoadingAI ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-green-600 dark:text-green-400 mt-2">Analyzing your inventory patterns...</p>
        </div>
      ) : (
        <>
          {/* Quick AI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {aiPredictions.filter(p => p.urgency === 'critical').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Critical Items</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {aiPredictions.filter(p => p.urgency === 'high').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Low Stock</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {aiSuggestions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Smart Tips</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {aiAlerts.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
            </div>
          </div>

          {showAIPanel && (
            <div className="space-y-4">
              {/* Critical Inventory Alerts */}
              {aiAlerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Alerts
                  </h4>
                  <div className="space-y-2">
                    {aiAlerts.slice(0, 3).map((alert, index) => (
                      <div key={`ai-alert-${alert.title}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{alert.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {alert.count} items need attention
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">{alert.action}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Predictions */}
              {aiPredictions.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Smart Reorder Predictions
                  </h4>
                  <div className="space-y-2">
                    {aiPredictions.slice(0, 3).map((prediction, index) => (
                      <div key={`ai-prediction-${prediction.itemName}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-orange-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{prediction.itemName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {prediction.daysRemaining} days remaining • Suggested: {prediction.suggestedReorderQuantity} units
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          Confidence: {(prediction.confidence * 100).toFixed(1)}% • {prediction.reasoning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Organization Suggestions */}
              {aiSuggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Smart Organization Tips
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.slice(0, 2).map((suggestion, index) => (
                      <div key={`ai-suggestion-${suggestion.title}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg p-3 border-l-4 border-blue-400">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{suggestion.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.description || suggestion.action}
                        </div>
                        {suggestion.items && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Items: {suggestion.items.map(i => i.name).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
              <p className="text-gray-600 dark:text-gray-300">Track household items, categories, and barcode scanning with AI insights</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => actions.setShowBarcodeScanner(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Barcode size={20} />
                <span>Scan Barcode</span>
              </button>
              <button
                onClick={() => actions.setShowMultiAddForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Users size={20} />
                <span>Multi Add</span>
              </button>
              <button
                onClick={() => actions.setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AIInsightsPanel />
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Items</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, location, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => actions.setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => actions.setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">View Mode</label>
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
                <button
                  onClick={() => actions.setViewMode('table')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => actions.setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  actions.resetFilters();
                }}
                className="flex-1 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-yellow-600" size={20} />
                <span className="text-yellow-800 font-medium">
                  {selectedItems.length} item(s) selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={deleteMultipleItems}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete Selected</span>
                </button>
                <button
                  onClick={() => actions.deselectAll()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={importFromCSV}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Import CSV</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {items.length} items | Filtered: {filteredItems.length} items
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Package className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <ShoppingCart className="text-green-600 dark:text-green-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <AlertTriangle className="text-orange-600 dark:text-orange-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {items.filter(item => item.quantity <= 1).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Eye className="text-purple-600 dark:text-purple-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Inventory Items ({filteredItems.length})</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={selectAllItems}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredItems.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                                              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                              <div className="text-sm text-gray-500 dark:text-gray-400">{item.notes}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map(tag => (
                              <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {item.category}
                        </span>
                      </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-1">
                                              <MapPin size={14} className="text-gray-400 dark:text-gray-500" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              item.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => actions.setEditingItem(item)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Edit Item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => actions.setEditingItem(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.notes}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">${item.price}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const itemData = {
                  name: formData.get('name'),
                  category: formData.get('category'),
                  quantity: parseInt(formData.get('quantity')),
                  location: formData.get('location'),
                  price: parseFloat(formData.get('price')),
                  notes: formData.get('notes'),
                  purchaseDate: formData.get('purchaseDate'),
                  expiryDate: formData.get('expiryDate') || null,
                  warranty: formData.get('warranty') || null,
                  supplier: formData.get('supplier') || null,
                  tags: formData.get('tags') || ''
                };
                
                if (editingItem) {
                  updateItem(editingItem.id, itemData);
                } else {
                  addItem(itemData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingItem?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      defaultValue={editingItem?.category || 'Kitchen'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={editingItem?.quantity || 1}
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        name="price"
                        defaultValue={editingItem?.price || ''}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      defaultValue={editingItem?.location || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      defaultValue={editingItem?.notes || ''}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingItem?.tags?.join(', ') || ''}
                      placeholder="appliance, kitchen, coffee"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        defaultValue={editingItem?.purchaseDate || new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        name="expiryDate"
                        defaultValue={editingItem?.expiryDate || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        name="warranty"
                        defaultValue={editingItem?.warranty || ''}
                        placeholder="2 years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                      <input
                        type="text"
                        name="supplier"
                        defaultValue={editingItem?.supplier || ''}
                        placeholder="Best Buy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                                      actions.setShowAddForm(false);
                actions.setEditingItem(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Add Items Modal */}
      {showMultiAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Multiple Items</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const itemsData = [
                  {
                    name: formData.get('name1'),
                    category: formData.get('category1'),
                    quantity: parseInt(formData.get('quantity1')),
                    location: formData.get('location1'),
                    price: parseFloat(formData.get('price1')),
                    notes: formData.get('notes1'),
                    tags: formData.get('tags1') || ''
                  },
                  {
                    name: formData.get('name2'),
                    category: formData.get('category2'),
                    quantity: parseInt(formData.get('quantity2')),
                    location: formData.get('location2'),
                    price: parseFloat(formData.get('price2')),
                    notes: formData.get('notes2'),
                    tags: formData.get('tags2') || ''
                  }
                ].filter(item => item.name && item.name.trim() !== '');
                
                if (itemsData.length > 0) {
                  addMultipleItems(itemsData);
                } else {
                  toast.error('Please fill in at least one item');
                }
              }}>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Item 1</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name1"
                      placeholder="Item Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="category1"
                      defaultValue="Kitchen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name="quantity1"
                        placeholder="Qty"
                        defaultValue="1"
                        min="1"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        name="price1"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      name="location1"
                      placeholder="Location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="notes1"
                      placeholder="Notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="tags1"
                      placeholder="Tags (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <hr className="my-4" />

                  <h4 className="font-medium text-gray-700">Item 2</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name2"
                      placeholder="Item Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="category2"
                      defaultValue="Kitchen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        name="quantity2"
                        placeholder="Qty"
                        defaultValue="1"
                        min="1"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        name="price2"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <input
                      type="text"
                      name="location2"
                      placeholder="Location"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="notes2"
                      placeholder="Notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="tags2"
                      placeholder="Tags (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Add Items
                  </button>
                  <button
                    type="button"
                    onClick={() => actions.setShowMultiAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <BarcodeScanner
          isOpen={showBarcodeScanner}
                          onClose={() => actions.setShowBarcodeScanner(false)}
          onScan={(scannedCode) => {
            // Handle scanned barcode/QR code
            console.log('Scanned code:', scannedCode);
            
            // Auto-fill item form with scanned data
            if (scannedCode) {
              // You can integrate with external APIs here to get product details
              const newItem = {
                id: Date.now().toString(),
                name: `Scanned Item (${scannedCode})`,
                category: 'Electronics', // Default category
                quantity: 1,
                location: 'To be determined',
                purchaseDate: new Date().toISOString().split('T')[0],
                expiryDate: null,
                price: 0,
                barcode: scannedCode,
                notes: `Auto-imported via ${scannedCode.includes('http') ? 'QR Code' : 'Barcode'} scanner`,
                status: 'active',
                warranty: null,
                supplier: 'Unknown',
                tags: ['scanned', 'imported']
              };
              
              actions.addItem(newItem);
              actions.setShowBarcodeScanner(false);
              toast.success(`Item scanned and added: ${scannedCode}`);
            }
          }}
        />
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/home" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
}

export default React.memo(InventoryManagement);
