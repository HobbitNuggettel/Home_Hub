import React, { useState, useEffect } from 'react';
import { Plus, ShoppingCart, CheckCircle, Circle, Trash2, Edit, Share, DollarSign, Calendar, Tag, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

const ShoppingLists = () => {
  const { currentUser } = useAuth();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddList, setShowAddList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [listForm, setListForm] = useState({
    name: '',
    description: '',
    budget: '',
    dueDate: '',
    category: 'general'
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    quantity: 1,
    estimatedPrice: '',
    priority: 'medium',
    notes: '',
    category: 'general'
  });

  const categories = [
    'general', 'groceries', 'household', 'electronics', 'clothing', 'books', 'tools', 'other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600 bg-gray-100' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600 bg-blue-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
  ];

  // Load shopping lists from Firebase
  useEffect(() => {
    const loadShoppingLists = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await hybridStorage.getShoppingLists(currentUser.uid);
        if (response.success) {
          setLists(response.data || []);
        } else {
          console.error('Failed to load shopping lists:', response.error);
          setLists([]);
        }
      } catch (error) {
        console.error('Error loading shopping lists:', error);
        setLists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadShoppingLists();
  }, [currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shopping lists...</p>
        </div>
      </div>
    );
  }

  const handleAddList = async () => {
    if (!listForm.name || !currentUser) return;
    
    try {
      const newList = {
        ...listForm,
        budget: parseFloat(listForm.budget) || 0,
        createdAt: new Date().toISOString().split('T')[0],
        items: []
      };
      
      const response = await hybridStorage.addShoppingList(currentUser.uid, newList);
      if (response.success) {
        setLists(prev => [...prev, response.list]);
        setListForm({
          name: '',
          description: '',
          budget: '',
          dueDate: '',
          category: 'general'
        });
        setShowAddList(false);
      } else {
        console.error('Failed to add shopping list:', response.error);
      }
    } catch (error) {
      console.error('Error adding shopping list:', error);
    }
  };

  const handleAddItem = () => {
    if (!itemForm.name || !selectedList) return;
    
    const newItem = {
      id: Date.now(),
      ...itemForm,
      estimatedPrice: parseFloat(itemForm.estimatedPrice) || 0,
      completed: false
    };
    
    const updatedLists = lists.map(list => 
      list.id === selectedList.id 
        ? { ...list, items: [...list.items, newItem] }
        : list
    );
    
    setLists(updatedLists);
    
    setItemForm({
      name: '',
      quantity: 1,
      estimatedPrice: '',
      priority: 'medium',
      notes: '',
      category: 'general'
    });
    setShowAddItem(false);
  };

  const handleDeleteList = (id) => {
    setLists(lists.filter(list => list.id !== id));
  };

  const handleDeleteItem = (listId, itemId) => {
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? { ...list, items: list.items.filter(item => item.id !== itemId) }
        : list
    );
    
    setLists(updatedLists);
  };

  const handleToggleItem = (listId, itemId) => {
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? {
            ...list,
            items: list.items.map(item => 
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            )
          }
        : list
    );
    
    setLists(updatedLists);
  };

  const handleEditItem = (listId, item) => {
    setSelectedList(lists.find(list => list.id === listId));
    setItemForm({
      name: item.name,
      quantity: item.quantity,
      estimatedPrice: item.estimatedPrice.toString(),
      priority: item.priority,
      notes: item.notes,
      category: item.category
    });
    setShowAddItem(true);
  };

  const handleUpdateItem = () => {
    if (!selectedList) return;
    
    const updatedLists = lists.map(list => 
      list.id === selectedList.id 
        ? {
            ...list,
            items: list.items.map(item => 
              item.name === itemForm.name 
                ? { ...item, ...itemForm, estimatedPrice: parseFloat(itemForm.estimatedPrice) || 0 }
                : item
            )
          }
        : list
    );
    
    setLists(updatedLists);
    setSelectedList(null);
    setItemForm({
      name: '',
      quantity: 1,
      estimatedPrice: '',
      priority: 'medium',
      notes: '',
      category: 'general'
    });
    setShowAddItem(false);
  };

  const getListStats = (list) => {
    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.completed).length;
    const totalEstimatedCost = list.items.reduce((sum, item) => sum + item.estimatedPrice, 0);
    const remainingBudget = list.budget - totalEstimatedCost;
    
    return {
      totalItems,
      completedItems,
      totalEstimatedCost,
      remainingBudget,
      completionPercentage: totalItems > 0 ? (completedItems / totalItems) * 100 : 0
    };
  };

  const getPriorityColor = (priority) => {
    return priorities.find(p => p.value === priority)?.color || 'text-gray-600 bg-gray-100';
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'text-gray-600 bg-gray-100',
      groceries: 'text-green-600 bg-green-100',
      household: 'text-blue-600 bg-blue-100',
      electronics: 'text-purple-600 bg-purple-100',
      clothing: 'text-pink-600 bg-pink-100',
      books: 'text-yellow-600 bg-yellow-100',
      tools: 'text-orange-600 bg-orange-100',
      other: 'text-gray-600 bg-gray-100'
    };
    return colors[category] || colors.other;
  };

  const getTotalBudget = () => {
    return lists.reduce((sum, list) => sum + list.budget, 0);
  };

  const getTotalEstimatedCost = () => {
    return lists.reduce((sum, list) => sum + getListStats(list).totalEstimatedCost, 0);
  };

  const getTotalRemainingBudget = () => {
    return getTotalBudget() - getTotalEstimatedCost();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Shopping Lists
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage shopping lists with budget tracking
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <List className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lists</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lists.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lists.reduce((sum, list) => sum + list.items.length, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${getTotalBudget().toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${getTotalRemainingBudget().toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add List Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddList(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Shopping List
          </button>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {lists.map((list) => {
            const stats = getListStats(list);
            
            return (
              <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {/* List Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {list.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(list.category)}`}>
                          {list.category}
                        </span>
                        {list.dueDate && (
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(list.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {list.budget > 0 && (
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Budget: ${list.budget.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedList(list);
                          setShowAddItem(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{stats.completionPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.completedItems}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">${stats.totalEstimatedCost.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Cost</p>
                    </div>
                  </div>
                </div>
                
                {/* Items List */}
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Items</h4>
                  
                  {list.items.length === 0 ? (
                    <div className="text-center py-4">
                      <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No items in this list yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {list.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.completed 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <button
                              onClick={() => handleToggleItem(list.id, item.id)}
                              className={`flex-shrink-0 ${
                                item.completed ? 'text-green-600' : 'text-gray-400'
                              }`}
                            >
                              {item.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-sm font-medium ${
                                  item.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                                }`}>
                                  {item.name}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                  {priorities.find(p => p.value === item.priority)?.label}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span>Qty: {item.quantity}</span>
                                {item.estimatedPrice > 0 && (
                                  <span>Est: ${item.estimatedPrice.toFixed(2)}</span>
                                )}
                                {item.notes && (
                                  <span className="truncate max-w-32" title={item.notes}>
                                    Note: {item.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditItem(list.id, item)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(list.id, item.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add List Form */}
        {showAddList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Shopping List</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={listForm.name}
                    onChange={(e) => setListForm({ ...listForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter list name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={listForm.description}
                    onChange={(e) => setListForm({ ...listForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget ($)
                    </label>
                    <input
                      type="number"
                      value={listForm.budget}
                      onChange={(e) => setListForm({ ...listForm, budget: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={listForm.category}
                      onChange={(e) => setListForm({ ...listForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={listForm.dueDate}
                    onChange={(e) => setListForm({ ...listForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddList(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddList}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Form */}
        {showAddItem && selectedList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Item to &quot;{selectedList.name}&quot;
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={itemForm.priority}
                      onChange={(e) => setItemForm({ ...itemForm, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Price ($)
                    </label>
                    <input
                      type="number"
                      value={itemForm.estimatedPrice}
                      onChange={(e) => setItemForm({ ...itemForm, estimatedPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={itemForm.notes}
                    onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Optional notes about this item"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddItem(false);
                    setSelectedList(null);
                    setItemForm({
                      name: '',
                      quantity: 1,
                      estimatedPrice: '',
                      priority: 'medium',
                      notes: '',
                      category: 'general'
                    });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={itemForm.name === '' ? handleAddItem : handleUpdateItem}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  {itemForm.name === '' ? 'Add Item' : 'Update Item'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingLists;
