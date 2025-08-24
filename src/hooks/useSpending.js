import { useState, useEffect, useCallback } from 'react';

export const useSpending = (options = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load expenses from localStorage
  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('homeHub_expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (err) {
      console.error('Failed to load expenses from localStorage:', err);
    }
  }, []);

  // Load budgets from localStorage
  useEffect(() => {
    try {
      const storedBudgets = localStorage.getItem('homeHub_budgets');
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      }
    } catch (err) {
      console.error('Failed to load budgets from localStorage:', err);
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('homeHub_expenses', JSON.stringify(expenses));
    } catch (err) {
      console.error('Failed to save expenses to localStorage:', err);
    }
  }, [expenses]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('homeHub_budgets', JSON.stringify(budgets));
    } catch (err) {
      console.error('Failed to save budgets to localStorage:', err);
    }
  }, [budgets]);

  const addExpense = useCallback(async (expenseData) => {
    setLoading(true);
    try {
      const newExpense = {
        id: Date.now() + Math.random(),
        ...expenseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setExpenses(prev => [...prev, newExpense]);
      return newExpense;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExpense = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      setExpenses(prev => prev.map(expense => 
        expense.id === id 
          ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
          : expense
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    setLoading(true);
    try {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addBudget = useCallback(async (budgetData) => {
    setLoading(true);
    try {
      const newBudget = {
        id: Date.now() + Math.random(),
        ...budgetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBudget = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      setBudgets(prev => prev.map(budget => 
        budget.id === id 
          ? { ...budget, ...updates, updatedAt: new Date().toISOString() }
          : budget
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    setLoading(true);
    try {
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchExpenses = useCallback((query) => {
    if (!query.trim()) return expenses;
    
    return expenses.filter(expense => 
      expense.description.toLowerCase().includes(query.toLowerCase()) ||
      expense.category.toLowerCase().includes(query.toLowerCase()) ||
      expense.merchant?.toLowerCase().includes(query.toLowerCase())
    );
  }, [expenses]);

  const filterExpensesByCategory = useCallback((category) => {
    if (!category) return expenses;
    return expenses.filter(expense => expense.category === category);
  }, [expenses]);

  const filterExpensesByDateRange = useCallback((startDate, endDate) => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [expenses]);

  const getSpendingAnalytics = useCallback(() => {
    if (expenses.length === 0) return null;

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const monthlySpending = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    return {
      totalSpent,
      categoryTotals,
      monthlySpending,
      averageExpense: totalSpent / expenses.length,
      totalExpenses: expenses.length
    };
  }, [expenses]);

  const getBudgetStatus = useCallback(() => {
    if (budgets.length === 0) return null;

    return budgets.map(budget => {
      const categoryExpenses = expenses.filter(expense => expense.category === budget.category);
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget.amount - spent;
      const percentageUsed = (spent / budget.amount) * 100;

      return {
        ...budget,
        spent,
        remaining,
        percentageUsed,
        isOverBudget: spent > budget.amount
      };
    });
  }, [budgets, expenses]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    expenses,
    budgets,
    loading,
    error,
    
    // Actions
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    
    // Queries
    searchExpenses,
    filterExpensesByCategory,
    filterExpensesByDateRange,
    
    // Analytics
    getSpendingAnalytics,
    getBudgetStatus,
    
    // Utilities
    clearError
  };
};

export default useSpending;
