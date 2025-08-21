import React, { useState, useEffect } from 'react';
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
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import BarcodeScanner from './BarcodeScanner';

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

export default function InventoryManagement() {
  const [items, setItems] = useState(mockItems);
  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMultiAddForm, setShowMultiAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [selectedItems, setSelectedItems] = useState([]);

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add new item
  const addItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      status: 'active',
      tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : []
    };
    setItems([...items, newItem]);
    setShowAddForm(false);
    toast.success('Item added successfully!');
  };

  // Add multiple items
  const addMultipleItems = (itemsData) => {
    const newItems = itemsData.map((itemData, index) => ({
      id: (Date.now() + index).toString(),
      ...itemData,
      status: 'active',
      tags: itemData.tags ? itemData.tags.split(',').map(tag => tag.trim()) : []
    }));
    setItems([...items, ...newItems]);
    setShowMultiAddForm(false);
    toast.success(`${newItems.length} items added successfully!`);
  };

  // Update existing item
  const updateItem = (id, updates) => {
    setItems(items.map(item => 
      item.id === id ? { 
        ...item, 
        ...updates,
        tags: updates.tags ? updates.tags.split(',').map(tag => tag.trim()) : item.tags
      } : item
    ));
    setEditingItem(null);
    toast.success('Item updated successfully!');
  };

  // Delete item
  const deleteItem = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
      toast.success('Item deleted successfully!');
    }
  };

  // Delete multiple items
  const deleteMultipleItems = () => {
    if (selectedItems.length === 0) {
      toast.error('No items selected');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      setItems(items.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      toast.success(`${selectedItems.length} items deleted successfully!`);
    }
  };

  // Export inventory to CSV
  const exportToCSV = () => {
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
  };

  // Import inventory from CSV (simulated)
  const importFromCSV = () => {
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
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Track household items, categories, and barcode scanning</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Barcode size={20} />
                <span>Scan Barcode</span>
              </button>
              <button
                onClick={() => setShowMultiAddForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Users size={20} />
                <span>Multi Add</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Items</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, location, notes, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
                  onClick={() => setSelectedItems([])}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Import CSV</span>
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Total: {items.length} items | Filtered: {filteredItems.length} items
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <ShoppingCart className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertTriangle className="text-orange-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.filter(item => item.quantity <= 1).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Eye className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Inventory Items ({filteredItems.length})</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={selectAllItems}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.notes}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map(tag => (
                              <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} className="text-gray-400" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Item"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
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
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.notes}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Category:</span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location:</span>
                      <span className="text-sm text-gray-900">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="text-sm font-medium text-gray-900">${item.price}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
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
                      setShowAddForm(false);
                      setEditingItem(null);
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
                    onClick={() => setShowMultiAddForm(false)}
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
          onClose={() => setShowBarcodeScanner(false)}
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
              
              setItems(prev => [newItem, ...prev]);
              setShowBarcodeScanner(false);
              toast.success(`Item scanned and added: ${scannedCode}`);
            }
          }}
        />
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
}
