import React from 'react';
import { TrendingUp, Package, DollarSign, AlertTriangle, MapPin, Calendar, Brain } from 'lucide-react';

const InventoryAnalytics = ({ 
  items = [], 
  aiPredictions = [], 
  aiSuggestions = [], 
  aiAlerts = [],
  isLoadingAI = false 
}) => {
  // Calculate basic statistics
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const lowStockItems = items.filter(item => item.status === 'low').length;
  const outOfStockItems = items.filter(item => item.status === 'out').length;
  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  // Category distribution
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  // Location distribution
  const locationCounts = items.reduce((acc, item) => {
    acc[item.location] = (acc[item.location] || 0) + 1;
    return acc;
  }, {});

  // Top categories
  const topCategories = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Top locations
  const topLocations = Object.entries(locationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

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

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiring Soon</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{expiringItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Inventory Insights & Smart Predictions
          </h3>
        </div>

        {isLoadingAI ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-green-600 dark:text-green-400 mt-2">Analyzing your inventory patterns...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick AI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {aiPredictions.filter(p => p.urgency === 'critical').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Critical Items</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {aiPredictions.filter(p => p.urgency === 'high').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {aiSuggestions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Smart Suggestions</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {aiAlerts.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
              </div>
            </div>

            {/* AI Predictions */}
            {aiPredictions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">AI Predictions</h4>
                <div className="space-y-2">
                  {aiPredictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
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

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Smart Suggestions</h4>
                <div className="space-y-2">
                  {aiSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalItems) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Locations</h3>
          <div className="space-y-3">
            {topLocations.map(([location, count]) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalItems) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Health */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(((totalItems - lowStockItems - outOfStockItems) / totalItems) * 100)}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Healthy Stock</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round((lowStockItems / totalItems) * 100)}%
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Low Stock</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Math.round((outOfStockItems / totalItems) * 100)}%
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Out of Stock</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
