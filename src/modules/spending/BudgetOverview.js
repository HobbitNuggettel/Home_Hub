import React from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';

const BudgetOverview = ({ 
  budgets = [], 
  onEdit, 
  onDelete, 
  onAdd 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    
    if (percentage >= 100) {
      return {
        status: 'exceeded',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (percentage >= 80) {
      return {
        status: 'warning',
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else if (percentage >= 60) {
      return {
        status: 'notice',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        icon: <TrendingUp className="w-4 h-4" />
      };
    } else {
      return {
        status: 'good',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        icon: <TrendingDown className="w-4 h-4" />
      };
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'quarterly': return 'Quarter';
      case 'yearly': return 'Year';
      default: return period;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Budget Overview
        </h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const status = getBudgetStatus(budget);
          const remaining = budget.amount - budget.spent;
          
          return (
            <div
              key={budget.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Budget Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {getPeriodLabel(budget.period)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onEdit(budget)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    title="Edit Budget"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(budget.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Category */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {budget.category}
              </h3>

              {/* Amount and Spent */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Budget:</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Spent:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(budget.spent)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className={`flex items-center justify-center p-2 rounded-lg ${status.bgColor}`}>
                <div className={`flex items-center space-x-2 ${status.color}`}>
                  {status.icon}
                  <span className="text-sm font-medium capitalize">
                    {status.status === 'exceeded' ? 'Over Budget' : 
                     status.status === 'warning' ? 'Warning' : 
                     status.status === 'notice' ? 'Notice' : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Period Info */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {budget.startDate && budget.endDate ? (
                    <>
                      {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                    </>
                  ) : (
                    `Current ${getPeriodLabel(budget.period).toLowerCase()}`
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {budgets.length === 0 && (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budgets set</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating your first budget to track your spending.
          </p>
          <div className="mt-6">
            <button
              onClick={onAdd}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {budgets.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {budgets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Budgets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.spent, 0))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {budgets.filter(b => (b.spent / b.amount) * 100 >= 80).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Near Limit</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
