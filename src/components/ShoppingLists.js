import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  List, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  Share,
  Download,
  Upload,
  Target,
  TrendingUp,
  Users,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock shopping lists data
const mockShoppingLists = [
  {
    id: '1',
    name: 'Weekly Groceries',
    description: 'Essential items for the week',
    category: 'Groceries',
    budget: 150.00,
    spent: 0,
    items: [
      { id: '1', name: 'Milk', quantity: 2, unit: 'gallons', estimatedPrice: 6.99, priority: 'high', category: 'Dairy', checked: false },
      { id: '2', name: 'Bread', quantity: 1, unit: 'loaf', estimatedPrice: 3.99, priority: 'high', category: 'Bakery', checked: false },
      { id: '3', name: 'Apples', quantity: 6, unit: 'pieces', estimatedPrice: 4.99, priority: 'medium', category: 'Produce', checked: false },
      { id: '4', name: 'Chicken Breast', quantity: 2, unit: 'lbs', estimatedPrice: 12.99, priority: 'high', category: 'Meat', checked: false }
    ],
    createdBy: 'John Smith',
    createdAt: '2024-01-20',
    dueDate: '2024-01-25',
    status: 'active',
    sharedWith: ['Jane Smith', 'Mike Smith'],
    tags: ['weekly', 'essential', 'groceries']
  },
  {
    id: '2',
    name: 'Home Improvement',
    description: 'Tools and supplies for DIY projects',
    category: 'Home & Garden',
    budget: 300.00,
    spent: 0,
    items: [
      { id: '5', name: 'Paint Brushes', quantity: 3, unit: 'pieces', estimatedPrice: 15.99, priority: 'medium', category: 'Tools', checked: false },
      { id: '6', name: 'Wall Paint', quantity: 2, unit: 'gallons', estimatedPrice: 45.99, priority: 'high', category: 'Paint', checked: false },
      { id: '7', name: 'Drop Cloth', quantity: 1, unit: 'piece', estimatedPrice: 12.99, priority: 'low', category: 'Supplies', checked: false }
    ],
    createdBy: 'John Smith',
    createdAt: '2024-01-18',
    dueDate: '2024-01-30',
    status: 'active',
    sharedWith: ['Jane Smith'],
    tags: ['home', 'diy', 'tools']
  }
];

const categories = [
  'Groceries', 'Home & Garden', 'Electronics', 'Clothing', 'Books', 'Sports', 'Automotive', 'Other'
];

const priorities = ['low', 'medium', 'high'];

export default function ShoppingLists() {
  const [shoppingLists, setShoppingLists] = useState(mockShoppingLists);
  const [viewMode, setViewMode] = useState('lists'); // 'lists', 'budget', 'analytics'
  const [showCreateList, setShowCreateList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter lists based on search and category
  const filteredLists = shoppingLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || list.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalBudget = shoppingLists.reduce((sum, list) => sum + list.budget, 0);
  const totalSpent = shoppingLists.reduce((sum, list) => sum + list.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Create new shopping list
  const createList = (listData) => {
    const newList = {
      id: Date.now().toString(),
      ...listData,
      items: [],
      spent: 0,
      status: 'active',
      createdBy: 'John Smith',
      createdAt: new Date().toISOString().split('T')[0],
      sharedWith: [],
      tags: listData.tags ? listData.tags.split(',').map(tag => tag.trim()) : []
    };
    setShoppingLists([...shoppingLists, newList]);
    setShowCreateList(false);
    toast.success('Shopping list created successfully!');
  };

  // Update list
  const updateList = (id, updates) => {
    setShoppingLists(shoppingLists.map(list => 
      list.id === id ? { ...list, ...updates } : list
    ));
    setEditingList(null);
    toast.success('Shopping list updated successfully!');
  };

  // Delete list
  const deleteList = (id) => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      setShoppingLists(shoppingLists.filter(list => list.id !== id));
      toast.success('Shopping list deleted successfully!');
    }
  };

  // Add item to list
  const addItem = (listId, itemData) => {
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      checked: false
    };
    
    setShoppingLists(shoppingLists.map(list => 
      list.id === listId 
        ? { ...list, items: [...list.items, newItem] }
        : list
    ));
    
    setShowAddItem(false);
    toast.success('Item added to list successfully!');
  };

  // Update item
  const updateItem = (listId, itemId, updates) => {
    setShoppingLists(shoppingLists.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : list
    ));
    setEditingItem(null);
    toast.success('Item updated successfully!');
  };

  // Delete item
  const deleteItem = (listId, itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setShoppingLists(shoppingLists.map(list => 
        list.id === listId 
          ? { ...list, items: list.items.filter(item => item.id !== itemId) }
          : list
      ));
      toast.success('Item deleted successfully!');
    }
  };

  // Toggle item checked status
  const toggleItemChecked = (listId, itemId) => {
    setShoppingLists(shoppingLists.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item => 
              item.id === itemId ? { ...item, checked: !item.checked } : item
            )
          }
        : list
    ));
  };

  // Export list to CSV
  const exportToCSV = (list) => {
    const csvContent = [
      ['Item', 'Quantity', 'Unit', 'Estimated Price', 'Priority', 'Category', 'Checked'],
      ...list.items.map(item => [
        item.name,
        item.quantity,
        item.unit,
        item.estimatedPrice,
        item.priority,
        item.category,
        item.checked ? 'Yes' : 'No'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('List exported to CSV!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Lists</h1>
              <p className="text-gray-600 dark:text-gray-300">Create and manage shopping lists with budget planning</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateList(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('lists')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'lists'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <List size={16} />
                <span>Lists</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('budget')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'budget'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign size={16} />
                <span>Budget</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp size={16} />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <List className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{shoppingLists.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <ShoppingCart className="text-purple-600 dark:text-purple-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shoppingLists.reduce((sum, list) => sum + list.items.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Target className="text-orange-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-900">{budgetUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'lists' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Lists</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, description, or tags..."
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
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Shopping Lists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map(list => (
                <div key={list.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{list.category}</span>
                          <span>Due: {new Date(list.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingList(list)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit List"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => exportToCSV(list)}
                          className="text-green-600 hover:text-green-900"
                          title="Export to CSV"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => deleteList(list.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete List"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Budget: ${list.budget.toFixed(2)}</span>
                        <span>Spent: ${list.spent.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (list.spent / list.budget) > 0.9 ? 'bg-red-500' : 
                            (list.spent / list.budget) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((list.spent / list.budget) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="space-y-2">
                      {list.items.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItemChecked(list.id, item.id)}
                            className="flex-shrink-0"
                          >
                            {item.checked ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <Circle size={16} className="text-gray-400" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} {item.unit} • ${item.estimatedPrice}
                            </p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                      {list.items.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{list.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedList(list);
                            setShowAddItem(true);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Add Item
                        </button>
                        <button
                          onClick={() => setSelectedList(list)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'budget' && (
          <div>
            {/* Budget Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">${totalBudget.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">${totalSpent.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totalRemaining.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
              
              {/* Budget Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Budget Progress</span>
                  <span>{budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      budgetUtilization > 90 ? 'bg-red-500' : 
                      budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Budget by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget by Category</h3>
              <div className="space-y-4">
                {categories.map(category => {
                  const categoryLists = shoppingLists.filter(list => list.category === category);
                  const categoryBudget = categoryLists.reduce((sum, list) => sum + list.budget, 0);
                  const categorySpent = categoryLists.reduce((sum, list) => sum + list.spent, 0);
                  const categoryUtilization = categoryBudget > 0 ? (categorySpent / categoryBudget) * 100 : 0;
                  
                  if (categoryBudget === 0) return null;
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{category}</h4>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            ${categorySpent.toFixed(2)} / ${categoryBudget.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {categoryUtilization.toFixed(1)}% used
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            categoryUtilization > 90 ? 'bg-red-500' : 
                            categoryUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(categoryUtilization, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div>
            {/* Spending Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trends</h3>
                <div className="h-64 flex items-end justify-center space-x-2">
                  <div className="text-center">
                    <div className="w-8 bg-blue-500 rounded-t" style={{ height: '60px' }}></div>
                    <div className="text-xs text-gray-600 mt-2">Jan</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-blue-500 rounded-t" style={{ height: '80px' }}></div>
                    <div className="text-xs text-gray-600 mt-2">Feb</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-blue-500 rounded-t" style={{ height: '45px' }}></div>
                    <div className="text-xs text-gray-600 mt-2">Mar</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 bg-blue-500 rounded-t" style={{ height: '90px' }}></div>
                    <div className="text-xs text-gray-600 mt-2">Apr</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryLists = shoppingLists.filter(list => list.category === category);
                    const categoryBudget = categoryLists.reduce((sum, list) => sum + list.budget, 0);
                    const percentage = totalBudget > 0 ? (categoryBudget / totalBudget) * 100 : 0;
                    
                    if (categoryBudget === 0) return null;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">${categoryBudget.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* List Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">List Performance</h3>
              <div className="space-y-3">
                {shoppingLists.map(list => {
                  const completionRate = list.items.length > 0 ? 
                    (list.items.filter(item => item.checked).length / list.items.length) * 100 : 0;
                  
                  return (
                    <div key={list.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{list.name}</p>
                        <p className="text-xs text-gray-500">{list.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{completionRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">complete</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit List Modal */}
      {(showCreateList || editingList) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingList ? 'Edit Shopping List' : 'Create New Shopping List'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const listData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  category: formData.get('category'),
                  budget: parseFloat(formData.get('budget')),
                  dueDate: formData.get('dueDate'),
                  tags: formData.get('tags') || ''
                };
                
                if (editingList) {
                  updateList(editingList.id, listData);
                } else {
                  createList(listData);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingList?.name || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      defaultValue={editingList?.description || ''}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        defaultValue={editingList?.category || 'Groceries'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                      <input
                        type="number"
                        name="budget"
                        defaultValue={editingList?.budget || ''}
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      defaultValue={editingList?.dueDate || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingList?.tags?.join(', ') || ''}
                      placeholder="weekly, essential, groceries"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingList ? 'Update List' : 'Create List'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateList(false);
                      setEditingList(null);
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

      {/* Add/Edit Item Modal */}
      {(showAddItem || editingItem) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Item' : 'Add Item to List'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const itemData = {
                  name: formData.get('name'),
                  quantity: parseInt(formData.get('quantity')),
                  unit: formData.get('unit'),
                  estimatedPrice: parseFloat(formData.get('estimatedPrice')),
                  priority: formData.get('priority'),
                  category: formData.get('category')
                };
                
                if (editingItem) {
                  updateItem(selectedList.id, editingItem.id, itemData);
                } else {
                  addItem(selectedList.id, itemData);
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <input
                        type="text"
                        name="unit"
                        defaultValue={editingItem?.unit || 'piece'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Price</label>
                    <input
                      type="number"
                      name="estimatedPrice"
                      defaultValue={editingItem?.estimatedPrice || ''}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        defaultValue={editingItem?.priority || 'medium'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        name="category"
                        defaultValue={editingItem?.category || ''}
                        required
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
                      setShowAddItem(false);
                      setEditingItem(null);
                      setSelectedList(null);
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

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
} 