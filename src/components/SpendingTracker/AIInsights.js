import React from 'react';
import { Brain, Lightbulb, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AIInsights({ insights, isLoading, onRefresh }) {
  if (!insights && !isLoading) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Spending Insights
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligent analysis of your spending patterns
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your spending patterns...</p>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Top Spending Categories */}
          {insights.topCategories && insights.topCategories.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                Top Spending Categories
              </h4>
              <div className="space-y-2">
                {insights.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${category.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Trends */}
          {insights.trends && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                Spending Trends
              </h4>
              <div className="space-y-2">
                {insights.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{trend.description}</span>
                    <span className={`text-sm font-medium ${
                      trend.type === 'increase' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {trend.type === 'increase' ? '+' : '-'}{trend.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
                Smart Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Alerts */}
          {insights.budgetAlerts && insights.budgetAlerts.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                Budget Alerts
              </h4>
              <div className="space-y-2">
                {insights.budgetAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {insights.summary && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Summary</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insights.summary}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No insights available yet. Add some expenses to get started!</p>
        </div>
      )}
    </div>
  );
}
