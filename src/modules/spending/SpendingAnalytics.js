import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, DollarSign, AlertTriangle, Brain, PieChart, BarChart3, Calendar, Target } from 'lucide-react';

const SpendingAnalytics = ({ 
  expenses = [], 
  budgets = [], 
  aiInsights = [], 
  aiSuggestions = [], 
  aiPredictions = [],
  isLoadingAI = false 
}) => {
  // Calculate basic statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Category spending analysis
  const categorySpending = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Monthly spending trend
  const monthlySpending = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + expense.amount;
    return acc;
  }, {});

  const monthlyTrend = Object.entries(monthlySpending)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-6);

  // Payment method analysis
  const paymentMethodSpending = expenses.reduce((acc, expense) => {
    acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + expense.amount;
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'low': return <AlertTriangle className="w-4 h-4 text-green-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBudgetStatusColor = (percentage) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Used</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{budgetUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
              <p className={`text-2xl font-semibold ${getBudgetStatusColor(budgetUtilization)}`}>
                {formatCurrency(remainingBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights & Smart Suggestions
          </h3>
        </div>

        {isLoadingAI ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600 dark:text-blue-400 mt-2">Analyzing your spending patterns...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick AI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {aiInsights.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Smart Insights</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {aiSuggestions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Savings Tips</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {aiPredictions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Expenses</div>
              </div>
            </div>

            {/* AI Insights */}
            {aiInsights.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Smart Insights</h4>
                <div className="space-y-2">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <div key={`ai-insight-${insight.id || insight.title || index}`} className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {insight.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Savings Tips</h4>
                <div className="space-y-2">
                  {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={`ai-suggestion-${suggestion.id || suggestion.title || index}`} className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Predictions */}
            {aiPredictions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Upcoming Expenses</h4>
                <div className="space-y-2">
                  {aiPredictions.slice(0, 3).map((prediction, index) => (
                    <div key={`ai-prediction-${prediction.id || prediction.title || index}`} className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="flex items-center space-x-2">
                        {getUrgencyIcon(prediction.urgency)}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {prediction.message}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${getStatusColor(prediction.urgency)}`}>
                        {prediction.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Spending Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(amount / totalExpenses) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Monthly Spending Trend
          </h3>
          <div className="space-y-3">
            {monthlyTrend.map(([month, amount]) => (
              <div key={month} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{month}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(amount / Math.max(...monthlyTrend.map(([,a]) => a))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Method Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Method Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(paymentMethodSpending).map(([method, amount]) => (
            <div key={method} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(amount)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{method}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {((amount / totalExpenses) * 100).toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Health Overview */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget Health Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {budgets.filter(b => (b.spent / b.amount) * 100 < 60).length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">On Track</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {budgets.filter(b => (b.spent / b.amount) * 100 >= 60 && (b.spent / b.amount) * 100 < 80).length}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Notice</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {budgets.filter(b => (b.spent / b.amount) * 100 >= 80 && (b.spent / b.amount) * 100 < 100).length}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Warning</div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {budgets.filter(b => (b.spent / b.amount) * 100 >= 100).length}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Over Budget</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SpendingAnalytics.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    amount: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired
  })),
  budgets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    spent: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  })),
  aiInsights: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    impact: PropTypes.string.isRequired
  })),
  aiSuggestions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    impact: PropTypes.string.isRequired
  })),
  aiPredictions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    impact: PropTypes.string.isRequired
  })),
  isLoadingAI: PropTypes.bool
};

export default SpendingAnalytics;
