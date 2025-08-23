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
  Settings,
  Brain,
  Lightbulb,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import AIExpenseService from '../../services/AIExpenseService';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import BudgetOverview from './BudgetOverview';
import SpendingAnalytics from './SpendingAnalytics';
import AIInsights from './AIInsights';

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
    amount: 100.00,
    spent: 15.99,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    status: 'active'
  }
];

export default function SpendingTracker() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'analytics', 'budgets'
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Calculate summary statistics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Filter expenses based on search and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = ['all', ...new Set(expenses.map(expense => expense.category))];

  // AI-powered insights
  useEffect(() => {
    if (expenses.length > 0) {
      generateAIInsights();
    }
  }, [expenses]);

  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    try {
      const insights = await AIExpenseService.generateSpendingInsights(expenses);
      setAiInsights(insights);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to generate AI insights:', error);
      }
      toast.error('Failed to generate AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddExpense = (expenseData) => {
    const newExpense = {
      ...expenseData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    };
    setExpenses([...expenses, newExpense]);
    setShowForm(false);
    toast.success('Expense added successfully!');
  };

  const handleEditExpense = (expenseData) => {
    setExpenses(expenses.map(expense => 
      expense.id === expenseData.id ? { ...expense, ...expenseData } : expense
    ));
    setEditingExpense(null);
    toast.success('Expense updated successfully!');
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(expense => expense.id !== expenseId));
    toast.success('Expense deleted successfully!');
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expenses.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setExpenses(importedData);
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
                Spending Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Monitor your expenses and stay on budget
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Remaining</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${remainingBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spending %</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{spendingPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expenses.length}</p>
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
                Expenses
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
                onClick={() => setViewMode('budgets')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  viewMode === 'budgets'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Budgets
              </button>
            </nav>
          </div>
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'list' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
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
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Expense List */}
            <ExpenseList
              expenses={filteredExpenses}
              onEdit={setEditingExpense}
              onDelete={handleDeleteExpense}
            />

            {/* AI Insights */}
            <AIInsights 
              insights={aiInsights}
              isLoading={isLoadingAI}
              onRefresh={generateAIInsights}
            />
          </>
        )}

        {viewMode === 'analytics' && (
          <SpendingAnalytics expenses={expenses} budgets={budgets} />
        )}

        {viewMode === 'budgets' && (
          <BudgetOverview 
            budgets={budgets}
            expenses={expenses}
            onUpdateBudget={(updatedBudget) => {
              setBudgets(budgets.map(budget => 
                budget.id === updatedBudget.id ? updatedBudget : budget
              ));
            }}
          />
        )}

        {/* Expense Form Modal */}
        {showForm && (
          <ExpenseForm
            onSubmit={handleAddExpense}
            onCancel={() => setShowForm(false)}
            categories={categories.filter(cat => cat !== 'all')}
          />
        )}

        {/* Edit Expense Form Modal */}
        {editingExpense && (
          <ExpenseForm
            expense={editingExpense}
            onSubmit={handleEditExpense}
            onCancel={() => setEditingExpense(null)}
            categories={categories.filter(cat => cat !== 'all')}
            isEditing={true}
          />
        )}

        {/* Import/Export Actions */}
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
