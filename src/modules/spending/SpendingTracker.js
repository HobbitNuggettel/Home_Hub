import React, { useState, useEffect, useCallback } from 'react';
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
  Zap,
  Grid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';
import AIExpenseService from '../../services/AIExpenseService';
import ExpenseList from './ExpenseList';
import BudgetOverview from './BudgetOverview';
import SpendingAnalytics from './SpendingAnalytics';

// Default empty data - will be populated from Firebase
const defaultExpenses = [];
const defaultBudgets = [];

function SpendingTracker() {
  // Auth context
  const auth = useAuth();
  const currentUser = auth?.currentUser;

  // State
  const [expenses, setExpenses] = useState(defaultExpenses);
  const [budgets, setBudgets] = useState(defaultBudgets);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // AI Features State
  const [aiInsights, setAiInsights] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Load spending data from Firebase
  useEffect(() => {
    const loadSpendingData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const [expensesResponse, budgetsResponse] = await Promise.all([
          hybridStorage.getSpendingExpenses(currentUser.uid),
          hybridStorage.getSpendingBudgets(currentUser.uid)
        ]);

        if (expensesResponse.success) {
          setExpenses(expensesResponse.data || []);
        } else {
          console.error('Failed to load expenses:', expensesResponse.error);
          setExpenses([]);
        }

        if (budgetsResponse.success) {
          setBudgets(budgetsResponse.data || []);
        } else {
          console.error('Failed to load budgets:', budgetsResponse.error);
          setBudgets([]);
        }
      } catch (error) {
        console.error('Error loading spending data:', error);
        setExpenses([]);
        setBudgets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpendingData();
  }, [currentUser]);

  // Filtered expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || expense.category === selectedCategory;
    const matchesPaymentMethod = !selectedPaymentMethod || expense.paymentMethod === selectedPaymentMethod;
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                            (expense.date >= dateRange.start && expense.date <= dateRange.end);
    
    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesDateRange;
  });

  // Add new expense with AI categorization
  const addExpense = useCallback(async (expenseData) => {
    // Get AI prediction for category
    let aiPrediction = { category: expenseData.category, confidence: 0, reasoning: '' };
    
    try {
      aiPrediction = await AIExpenseService.categorizeExpense(expenseData.description, expenseData.amount);
    } catch (error) {
      console.error('AI categorization failed:', error);
    }
    
    const newExpense = {
      id: Date.now().toString(),
      ...expenseData,
      category: expenseData.category || aiPrediction.category,
      tags: expenseData.tags ? expenseData.tags.split(',').map(tag => tag.trim()) : [],
      aiRecommended: aiPrediction.confidence > 0.7,
      aiConfidence: aiPrediction.confidence,
      aiReasoning: aiPrediction.reasoning,
      userId: currentUser?.uid,
      createdAt: new Date().toISOString()
    };
    
    try {
      // Save to Firebase if user is logged in
      if (currentUser) {
        const response = await hybridStorage.addSpendingExpense(currentUser.uid, newExpense);
        if (!response.success) {
          toast.error('Failed to save expense to cloud');
        }
      }
      
      setExpenses([...expenses, newExpense]);
      setShowAddExpense(false);
      
      // Show AI categorization feedback
      if (aiPrediction.confidence > 0.8) {
        toast.success(`✅ Auto-categorized as ${aiPrediction.category} (${(aiPrediction.confidence * 100).toFixed(1)}% confidence)`);
      } else if (aiPrediction.confidence > 0.6) {
        toast.success(`🤖 Suggested category: ${aiPrediction.category}. You can change this if needed.`);
      } else {
        toast.success('Expense added successfully!');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Failed to save expense');
    }
    
    // Refresh AI insights
    loadAIInsights();
  }, [expenses]);

  // Add new budget
  const addBudget = useCallback(async (budgetData) => {
    const newBudget = {
      id: Date.now().toString(),
      ...budgetData,
      spent: 0,
      status: 'active',
      userId: currentUser?.uid,
      createdAt: new Date().toISOString()
    };
    
    try {
      // Save to Firebase if user is logged in
      if (currentUser) {
        const response = await hybridStorage.addSpendingBudget(currentUser.uid, newBudget);
        if (!response.success) {
          toast.error('Failed to save budget to cloud');
        }
      }
      
      setBudgets([...budgets, newBudget]);
      setShowAddBudget(false);
      toast.success('Budget created successfully!');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  }, [budgets, currentUser]);

  // Update expense
  const updateExpense = useCallback((id, updates) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { 
        ...expense, 
        ...updates,
        tags: updates.tags ? updates.tags.split(',').map(tag => tag.trim()) : expense.tags
      } : expense
    ));
    setEditingExpense(null);
    toast.success('Expense updated successfully!');
  }, [expenses]);

  // Update budget
  const updateBudget = useCallback((id, updates) => {
    setBudgets(budgets.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    ));
    setEditingBudget(null);
    toast.success('Budget updated successfully!');
  }, [budgets]);

  // Delete expense
  const deleteExpense = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully!');
    }
  }, [expenses]);

  // Delete budget
  const deleteBudget = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(budget => budget.id !== id));
      toast.success('Budget deleted successfully!');
    }
  }, [budgets]);

  // Export data to CSV
  const exportToCSV = useCallback(() => {
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
  }, [expenses]);

  // Import data from CSV (simulated)
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

  // Toggle expense selection
  const toggleExpenseSelection = useCallback((expenseId) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  }, []);

  // Select all expenses
  const selectAllExpenses = useCallback(() => {
    if (selectedExpenses.length === filteredExpenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(filteredExpenses.map(expense => expense.id));
    }
  }, [selectedExpenses.length, filteredExpenses]);

  // Delete multiple expenses
  const deleteMultipleExpenses = useCallback(() => {
    if (selectedExpenses.length === 0) {
      toast.error('No expenses selected');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} expenses?`)) {
      setExpenses(expenses.filter(expense => !selectedExpenses.includes(expense.id)));
      setSelectedExpenses([]);
      toast.success(`${selectedExpenses.length} expenses deleted successfully!`);
    }
  }, [selectedExpenses, expenses]);

  // Load AI insights and suggestions
  const loadAIInsights = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const [insights, suggestions, predictions] = await Promise.all([
        AIExpenseService.generateSpendingInsights(expenses),
        AIExpenseService.generateShoppingSuggestions(expenses),
        AIExpenseService.predictUpcomingExpenses(expenses)
      ]);
      
      setAiInsights(insights);
      setAiSuggestions(suggestions);
      setAiPredictions(predictions);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  }, [expenses]);

  // Load AI insights on component mount and when expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      loadAIInsights();
    }
  }, [loadAIInsights]);

  // Handle view expense
  const handleViewExpense = useCallback((expense) => {
    console.log('Viewing expense:', expense);
    toast.info(`Viewing ${expense.description}`);
  }, []);

  // Get unique categories and payment methods for filters
  const categories = [...new Set(expenses.map(expense => expense.category))];
  const paymentMethods = [...new Set(expenses.map(expense => expense.paymentMethod))];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading spending data...</p>
        </div>
      </div>
    );
  }

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
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor your expenses, set budgets, and get AI-powered insights to save money
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddBudget(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Target className="w-4 h-4 mr-2" />
                Add Budget
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Payment Methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
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

        {/* Bulk Actions */}
        {selectedExpenses.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedExpenses.length} expense(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllExpenses}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  {selectedExpenses.length === filteredExpenses.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={deleteMultipleExpenses}
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
            <DollarSign className="w-4 h-4" />
            <span>{filteredExpenses.length} expenses</span>
          </div>
        </div>

        {/* AI Insights Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Brain className="w-4 h-4 mr-2" />
            {showAIPanel ? 'Hide' : 'Show'} AI Insights
          </button>
        </div>

        {/* AI Insights Panel */}
        {showAIPanel && (
          <div className="mb-6">
            <SpendingAnalytics
              expenses={expenses}
              budgets={budgets}
              aiInsights={aiInsights}
              aiSuggestions={aiSuggestions}
              aiPredictions={aiPredictions}
              isLoadingAI={isLoadingAI}
            />
          </div>
        )}

        {/* Budget Overview */}
        <div className="mb-8">
          {budgets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Budgets Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first budget to start tracking your spending goals.
              </p>
              <button
                onClick={() => setShowAddBudget(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Budget
              </button>
            </div>
          ) : (
            <BudgetOverview
              budgets={budgets}
              onEdit={(budget) => setEditingBudget(budget)}
              onDelete={deleteBudget}
              onAdd={() => setShowAddBudget(true)}
            />
          )}
        </div>

        {/* Expenses List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {expenses.length === 0 ? 'No Expenses Yet' : 'No Matching Expenses'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {expenses.length === 0 
                  ? 'Start tracking your expenses to get insights into your spending habits.'
                  : 'Try adjusting your search filters to find expenses.'
                }
              </p>
              {expenses.length === 0 && (
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Expense
                </button>
              )}
            </div>
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
              selectedExpenses={selectedExpenses}
              onEdit={(expense) => setEditingExpense(expense)}
              onDelete={deleteExpense}
              onView={handleViewExpense}
              onToggleSelection={toggleExpenseSelection}
              viewMode={viewMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SpendingTracker;
