import React, { useEffect, useCallback, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Barcode, 
  Upload,
  Download,
  FileText,
  Users,
  Brain,
  Grid,
  List,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeScanner from '../BarcodeScanner';
import { useInventory } from '../../hooks/useInventory';
import AIInventoryService from '../../services/AIInventoryService';
import InventoryList from './InventoryList';
import InventoryForm from './InventoryForm';
import InventoryAnalytics from './InventoryAnalytics';

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
  }
];

function InventoryManagement() {
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
  } = useInventory(mockItems, mockCategories);

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

  // Handle view item
  const handleViewItem = useCallback((item) => {
    // For now, just show item details in console
    console.log('Viewing item:', item);
    toast.info(`Viewing ${item.name}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inventory Management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track, organize, and optimize your home inventory with AI-powered insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => actions.setShowBarcodeScanner(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Barcode className="w-4 h-4 mr-2" />
                Scan Barcode
              </button>
              <button
                onClick={() => actions.setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => actions.setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => actions.setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => actions.setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => actions.setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedItems.length} item(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllItems}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={deleteMultipleItems}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={importFromCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{filteredItems.length} items</span>
          </div>
        </div>

        {/* AI Insights Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Brain className="w-4 h-4 mr-2" />
            {showAIPanel ? 'Hide' : 'Show'} AI Insights
          </button>
        </div>

        {/* AI Insights Panel */}
        {showAIPanel && (
          <div className="mb-6">
            <InventoryAnalytics
              items={items}
              aiPredictions={aiPredictions}
              aiSuggestions={aiSuggestions}
              aiAlerts={aiAlerts}
              isLoadingAI={isLoadingAI}
            />
          </div>
        )}

        {/* Inventory List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <InventoryList
            items={filteredItems}
            selectedItems={selectedItems}
            onEdit={(item) => actions.setEditingItem(item)}
            onDelete={deleteItem}
            onView={handleViewItem}
            onToggleSelection={toggleItemSelection}
            viewMode={viewMode}
          />
        </div>

        {/* Forms */}
        {showAddForm && (
          <InventoryForm
            categories={categories}
            onSave={addItem}
            onCancel={() => actions.setShowAddForm(false)}
            mode="add"
          />
        )}

        {editingItem && (
          <InventoryForm
            item={editingItem}
            categories={categories}
            onSave={(updates) => updateItem(editingItem.id, updates)}
            onCancel={() => actions.setEditingItem(null)}
            mode="edit"
          />
        )}

        {/* Barcode Scanner */}
        {showBarcodeScanner && (
          <BarcodeScanner
            onClose={() => actions.setShowBarcodeScanner(false)}
            onScan={(barcode) => {
              console.log('Scanned barcode:', barcode);
              toast.success(`Barcode scanned: ${barcode}`);
              actions.setShowBarcodeScanner(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default InventoryManagement;
