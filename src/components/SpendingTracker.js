import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ShoppingCart,
  AlertTriangle,
  PieChart,
  BarChart3,
  CreditCard,
  Wallet,
  PiggyBank,
  Target,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock spending data
const mockExpenses = [
  {
    id: '1',
    description: 'Grocery Shopping',
    amount: 125.50,
    category: 'Food & Groceries',
    paymentMethod: 'Credit Card',
    date: '2024-01-20',
    recurring: false,
    notes: 'Weekly grocery run',
    tags: ['essential', 'weekly']
  },
  {
    id: '2',
    description: 'Gas Station',
    amount: 45.00,
    category: 'Transportation',
    paymentMethod: 'Debit Card',
    date: '2024-01-19',
    recurring: false,
    notes: 'Fuel for car',
    tags: ['essential', 'transport']
  },
  {
    id: '3',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    date: '2024-01-15',
    recurring: true,
    notes: 'Monthly streaming service',
    tags: ['subscription', 'entertainment']
  },
  {
    id: '4',
    description: 'Home Depot',
    amount: 89.99,
    category: 'Home & Garden',
    paymentMethod: 'Credit Card',
    date: '2024-01-18',
    recurring: false,
    notes: 'Garden tools and supplies',
    tags: ['home', 'tools']
  },
  {
    id: '5',
    description: 'Restaurant Dinner',
    amount: 67.50,
    category: 'Dining Out',
    paymentMethod: 'Credit Card',
    date: '2024-01-17',
    recurring: false,
    notes: 'Date night dinner',
    tags: ['dining', 'entertainment']
  }
];

const mockBudgets = [
  {
    id: '1',
    category: 'Food & Groceries',
    amount: 500.00,
    spent: 125.50,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active'
  },
  {
    id: '2',
    category: 'Transportation',
    amount: 200.00,
    spent: 45.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active'
  },
  {
    id: '3',
    category: 'Entertainment',
    amount: 150.00,
    spent: 83.49,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active'
  },
  {
    id: '4',
    category: 'Home & Garden',
    amount: 300.00,
    spent: 89.99,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active'
  }
];

const categories = [
  'Food & Groceries', 'Transportation', 'Entertainment', 'Home & Garden', 
  'Dining Out', 'Healthcare', 'Education', 'Shopping', 'Utilities', 
  'Insurance', 'Travel', 'Other'
];

const paymentMethods = [
  'Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'Digital Wallet', 'Check'
];

export default function SpendingTracker() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [viewMode, setViewMode] = useState('expenses'); // 'expenses', 'budgets', 'analytics'

  // Filter expenses based on search and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate totals
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get current period expenses
  const getCurrentPeriodExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
  };

  const currentPeriodExpenses = getCurrentPeriodExpenses();
  const currentPeriodTotal = currentPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Add new expense
  const addExpense = (expenseData) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      tags: expenseData.tags ? expenseData.tags.split(',').map(tag => tag.trim()) : []
    };
    setExpenses([...expenses, newExpense]);
    setShowAddExpense(false);
    toast.success('Expense added successfully!');
  };

  // Add new budget
  const addBudget = (budgetData) => {
    const newBudget = {
      id: Date.now().toString(),
      ...budgetData,
      spent: 0,
      status: 'active'
    };
    setBudgets([...budgets, newBudget]);
    setShowAddBudget(false);
    toast.success('Budget created successfully!');
  };

  // Update expense
  const updateExpense = (id, updates) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { 
        ...expense, 
        ...updates,
        tags: updates.tags ? updates.tags.split(',').map(tag => tag.trim()) : expense.tags
      } : expense
    ));
    setEditingExpense(null);
    toast.success('Expense updated successfully!');
  };

  // Update budget
  const updateBudget = (id, updates) => {
    setBudgets(budgets.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    ));
    setEditingBudget(null);
    toast.success('Budget updated successfully!');
  };

  // Delete expense
  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully!');
    }
  };

  // Delete budget
  const deleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(budget => budget.id !== id));
      toast.success('Budget deleted successfully!');
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Description', 'Amount', 'Category', 'Payment Method', 'Date', 'Recurring', 'Notes', 'Tags'],
      ...expenses.map(expense => [
        expense.description,
        expense.amount,
        expense.category,
        expense.paymentMethod,
        expense.date,
        expense.recurring ? 'Yes' : 'No',
        expense.notes,
        expense.tags.join(', ')
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Expenses exported to CSV!');
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Food & Groceries': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Home & Garden': 'bg-orange-100 text-orange-800',
      'Dining Out': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-pink-100 text-pink-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Shopping': 'bg-yellow-100 text-yellow-800',
      'Utilities': 'bg-gray-100 text-gray-800',
      'Insurance': 'bg-teal-100 text-teal-800',
      'Travel': 'bg-cyan-100 text-cyan-800',
      'Other': 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spending & Budgeting</h1>
              <p className="text-gray-600 dark:text-gray-300">Track expenses, manage budgets, and analyze spending patterns</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddBudget(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Target size={20} />
                <span>Create Budget</span>
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Expense</span>
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
              onClick={() => setViewMode('expenses')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'expenses'
                  ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign size={16} />
                <span>Expenses</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('budgets')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'budgets'
                  ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target size={16} />
                <span>Budgets</span>
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
                <BarChart3 size={16} />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <DollarSign className="text-red-600 dark:text-red-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Target className="text-blue-600 dark:text-blue-400" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <PiggyBank className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">${remainingBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{budgetUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current Period Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Current Period (January 2024)</h3>
              <p className="text-sm text-gray-600">Track your spending for the current month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${currentPeriodTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-600">spent this month</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Budget Progress</span>
              <span>{budgetUtilization.toFixed(1)}%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  budgetUtilization > 90 ? 'bg-red-500' : 
                  budgetUtilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
          </div>
        </div>
      </div>

        {/* Main Content */}
        {viewMode === 'expenses' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Expenses</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by description, notes, or tags..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
                <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                      setSearchTerm('');
                setSelectedCategory('all');
                      setSelectedPeriod('month');
              }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    title="Export to CSV"
                  >
                    <Download size={16} />
                  </button>
          </div>
        </div>
      </div>

            {/* Expenses List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Expenses ({filteredExpenses.length})</h3>
                </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurring</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                            <div className="text-sm text-gray-500">{expense.notes}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {expense.tags.map(tag => (
                                <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  {tag}
                                </span>
              ))}
          </div>
        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-gray-900">${expense.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            {expense.paymentMethod === 'Credit Card' ? (
                              <CreditCard size={14} className="text-blue-500" />
                            ) : expense.paymentMethod === 'Debit Card' ? (
                              <Wallet size={14} className="text-green-500" />
                            ) : (
                              <DollarSign size={14} className="text-gray-500" />
                            )}
                            <span>{expense.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.recurring ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingExpense(expense)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Expense"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Expense"
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
          </div>
        )}

        {viewMode === 'budgets' && (
          <div>
            {/* Budgets Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Budget Overview</h3>
                <button
                  onClick={() => setShowAddBudget(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Budget</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map(budget => {
                  const utilization = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                  const remaining = budget.amount - budget.spent;
                  return (
                    <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{budget.category}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingBudget(budget)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Budget"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Budget"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium text-gray-900">${budget.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-medium text-gray-900">${budget.spent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Remaining:</span>
                          <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${remaining.toFixed(2)}
                        </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{utilization.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilization > 90 ? 'bg-red-500' : 
                              utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          ></div>
                        </div>
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
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryExpenses = expenses.filter(expense => expense.category === category);
                    const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                    const percentage = totalSpent > 0 ? (categoryTotal / totalSpent) * 100 : 0;
                    
                    if (categoryTotal === 0) return null;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category).replace('text-', 'bg-').split(' ')[0]}`}></div>
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">${categoryTotal.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map(method => {
                    const methodExpenses = expenses.filter(expense => expense.paymentMethod === method);
                    const methodTotal = methodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                    const percentage = totalSpent > 0 ? (methodTotal / totalSpent) * 100 : 0;
                    
                    if (methodTotal === 0) return null;
                    
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-gray-900">{method}</span>
                    </div>
                    <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">${methodTotal.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                    );
                  })}
                </div>
        </div>
      </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trend</h3>
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
                <div className="text-center">
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: '70px' }}></div>
                  <div className="text-xs text-gray-600 mt-2">May</div>
                </div>
                <div className="text-center">
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: '55px' }}></div>
                  <div className="text-xs text-gray-600 mt-2">Jun</div>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>

      {/* Add/Edit Expense Modal */}
      {(showAddExpense || editingExpense) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <form onSubmit={(e) => {
    e.preventDefault();
                const formData = new FormData(e.target);
                const expenseData = {
                  description: formData.get('description'),
                  amount: parseFloat(formData.get('amount')),
                  category: formData.get('category'),
                  paymentMethod: formData.get('paymentMethod'),
                  date: formData.get('date'),
                  recurring: formData.get('recurring') === 'true',
                  notes: formData.get('notes'),
                  tags: formData.get('tags') || ''
                };
                
                if (editingExpense) {
                  updateExpense(editingExpense.id, expenseData);
                } else {
                  addExpense(expenseData);
                }
              }}>
                <div className="space-y-4">
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
                      name="description"
                      defaultValue={editingExpense?.description || ''}
                      required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
                      name="amount"
                      defaultValue={editingExpense?.amount || ''}
              step="0.01"
                      min="0"
                      required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                        name="category"
                        defaultValue={editingExpense?.category || 'Food & Groceries'}
                        required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        defaultValue={editingExpense?.paymentMethod || 'Credit Card'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                  </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                      name="date"
                      defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]}
                      required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                    <select
                      name="recurring"
                      defaultValue={editingExpense?.recurring?.toString() || 'false'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      defaultValue={editingExpense?.notes || ''}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
          </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                      name="tags"
                      defaultValue={editingExpense?.tags?.join(', ') || ''}
                      placeholder="essential, weekly, food"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingExpense ? 'Update Expense' : 'Add Expense'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddExpense(false);
                      setEditingExpense(null);
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

      {/* Add/Edit Budget Modal */}
      {(showAddBudget || editingBudget) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const budgetData = {
                  category: formData.get('category'),
                  amount: parseFloat(formData.get('amount')),
                  period: formData.get('period'),
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate')
                };
                
                if (editingBudget) {
                  updateBudget(editingBudget.id, budgetData);
                } else {
                  addBudget(budgetData);
                }
              }}>
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                      name="category"
                      defaultValue={editingBudget?.category || 'Food & Groceries'}
                      required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      defaultValue={editingBudget?.amount || ''}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select
                      name="period"
                      defaultValue={editingBudget?.period || 'monthly'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        defaultValue={editingBudget?.startDate || new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
          </div>
          <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        defaultValue={editingBudget?.endDate || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                  </button>
            <button
              type="button"
                    onClick={() => {
                      setShowAddBudget(false);
                      setEditingBudget(null);
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