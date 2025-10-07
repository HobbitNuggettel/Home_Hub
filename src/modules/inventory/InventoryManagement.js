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
  X,
  Zap,
  TrendingUp,
  Clock,
  Target,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeScanner from '../../components/BarcodeScanner.js';
import { useInventory } from '../../hooks/useInventory.js';
import AIInventoryService from '../../services/AIInventoryService.js';
import InventoryList from './InventoryList.js';
import InventoryForm from './InventoryForm.js';
import InventoryAnalytics from './InventoryAnalytics.js';
import InventoryAlerts from './InventoryAlerts.js';
import AIInsights from './AIInsights.js';

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
  }
];

export default function InventoryManagement() {
  const { inventory, categories, loading, error, actions } = useInventory();
  const [localInventory, setLocalInventory] = useState(inventory ?? []);
  const [localCategories] = useState(categories || mockCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'analytics', 'alerts', 'ai-insights'
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Sync with hook data
  useEffect(() => {
    setLocalInventory(inventory ?? []);
  }, [inventory]);

  // Calculate summary statistics
  const totalItems = localInventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = localInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockItems = localInventory.filter(item => item.status === 'low').length;
  const expiringItems = localInventory.filter(item => 
    item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  // Filter inventory based on search and filters
  const filteredInventory = localInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique statuses for filter
  const statuses = ['all', ...new Set(localInventory.map(item => item.status))];

  // AI-powered insights function
  const generateAIInsights = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const insights = await AIInventoryService.predictInventoryNeeds(localInventory);
      setAiInsights(insights);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to generate AI insights:', error);
      }
      toast.error('Failed to generate AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  }, [localInventory]);

  // AI-powered insights
  useEffect(() => {
    if (localInventory.length > 0) {
      generateAIInsights();
    }
  }, [localInventory, generateAIInsights]);

  const handleAddItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      purchaseDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    const updatedInventory = [...localInventory, newItem];
    setLocalInventory(updatedInventory);
    if (actions?.addItem) {
      actions.addItem(newItem);
    }
    setShowForm(false);
    toast.success('Item added successfully!');
  };

  const handleEditItem = (itemData) => {
    const updatedInventory = localInventory.map(item => 
      item.id === itemData.id ? { ...item, ...itemData } : item
    );
    setLocalInventory(updatedInventory);
    if (actions?.updateItem) {
      actions.updateItem(itemData);
    }
    setEditingItem(null);
    toast.success('Item updated successfully!');
  };

  const handleDeleteItem = (itemId) => {
    const updatedInventory = localInventory.filter(item => item.id !== itemId);
    setLocalInventory(updatedInventory);
    if (actions?.deleteItem) {
      actions.deleteItem(itemId);
    }
    toast.success('Item deleted successfully!');
  };

  const handleScanBarcode = (barcode) => {
    // Handle barcode scanning
    setShowScanner(false);
    toast.success(`Barcode scanned: ${barcode}`);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(localInventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory.json';
    link.click();
    URL.revokeObjectURL(url);
    if (actions?.exportCSV) {
      actions.exportCSV();
    }
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setLocalInventory(importedData);
          if (actions?.importCSV) {
            actions.importCSV(importedData);
          }
          toast.success('Data imported successfully!');
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inventory Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track and manage your household inventory
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowScanner(true)}
                className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Barcode className="w-5 h-5 mr-2" />
                Scan Barcode
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStockItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiringItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setViewMode('list')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'list'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setViewMode('alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'alerts'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setViewMode('ai-insights')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'ai-insights'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                AI Insights
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters - Always visible */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {localCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

        {/* Import/Export Actions - Always visible */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Grid View
              </button>
            </div>
          </div>
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'list' && (
          <>
            {/* Inventory List */}
            <InventoryList
              inventory={filteredInventory}
              onEdit={setEditingItem}
              onDelete={handleDeleteItem}
            />
          </>
        )}

        {viewMode === 'analytics' && (
          <InventoryAnalytics inventory={localInventory} />
        )}

        {viewMode === 'alerts' && (
          <InventoryAlerts inventory={localInventory} />
        )}

        {viewMode === 'ai-insights' && (
          <AIInsights 
            insights={aiInsights}
            isLoading={isLoadingAI}
            onRefresh={generateAIInsights}
          />
        )}

        {/* Inventory Form Modal */}
        {showForm && (
          <InventoryForm
            onSubmit={handleAddItem}
            onCancel={() => setShowForm(false)}
            categories={localCategories}
          />
        )}

        {/* Edit Inventory Form Modal */}
        {editingItem && (
          <InventoryForm
            item={editingItem}
            onSubmit={handleEditItem}
            onCancel={() => setEditingItem(null)}
            categories={localCategories}
            isEditing={true}
          />
        )}

        {/* Barcode Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Barcode Scanner
                </h2>
                <button
                  onClick={() => setShowScanner(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <BarcodeScanner onScan={handleScanBarcode} />
              </div>
            </div>
          </div>
        )}

        {/* Import/Export Actions - Always visible */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
