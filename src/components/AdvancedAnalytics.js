import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalItems: 156,
      totalValue: 15420.50,
      activeUsers: 4,
      alerts: 3,
      recentActivity: 12
    },
    inventory: {
      categories: [
        { name: 'Electronics', count: 23, value: 8900.00, trend: 'up' },
        { name: 'Kitchen', count: 34, value: 2100.00, trend: 'stable' },
        { name: 'Bathroom', count: 18, value: 450.00, trend: 'down' },
        { name: 'Bedroom', count: 28, value: 1200.00, trend: 'up' },
        { name: 'Living Room', count: 22, value: 1800.00, trend: 'stable' },
        { name: 'Garage', count: 15, value: 800.00, trend: 'up' },
        { name: 'Office', count: 16, value: 370.50, trend: 'stable' }
      ],
      trends: {
        monthly: [120, 135, 142, 138, 145, 156],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      }
    },
    spending: {
      monthly: [1200, 1350, 980, 2100, 1650, 1800],
      categories: [
        { name: 'Electronics', amount: 8900.00, percentage: 58 },
        { name: 'Kitchen', amount: 2100.00, percentage: 14 },
        { name: 'Furniture', amount: 1800.00, percentage: 12 },
        { name: 'Clothing', amount: 1200.00, percentage: 8 },
        { name: 'Other', amount: 1420.50, percentage: 8 }
      ],
      savings: 3200.00,
      budgetUtilization: 78
    },
    performance: {
      responseTime: 0.8,
      uptime: 99.9,
      userSatisfaction: 4.8,
      featureUsage: {
        inventory: 95,
        spending: 87,
        collaboration: 78,
        recipes: 65,
        automation: 45
      }
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Comprehensive insights into your household management</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'inventory', name: 'Inventory', icon: Package },
              { id: 'spending', name: 'Spending', icon: DollarSign },
              { id: 'performance', name: 'Performance', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMetric(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedMetric === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Dashboard */}
        {selectedMetric === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalItems}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  <span className="text-green-600 dark:text-green-400">+12%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.overview.totalValue)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  <span className="text-green-600 dark:text-green-400">+8.5%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.activeUsers}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
                  <span className="text-green-600 dark:text-green-400">+25%</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">from last month</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.alerts}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
                  <span className="text-red-600 dark:text-red-400">-2</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">from last week</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { action: 'Item added', item: 'Coffee Maker', user: 'John', time: '2 hours ago', type: 'add' },
                    { action: 'Expense logged', item: 'Grocery shopping', user: 'Sarah', time: '4 hours ago', type: 'expense' },
                    { action: 'Recipe created', item: 'Pasta Carbonara', user: 'Mike', time: '1 day ago', type: 'recipe' },
                    { action: 'Alert resolved', item: 'Low inventory alert', user: 'System', time: '2 days ago', type: 'alert' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'add' ? 'bg-green-500' :
                        activity.type === 'expense' ? 'bg-blue-500' :
                        activity.type === 'recipe' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.action}: <span className="text-gray-600 dark:text-gray-400">{activity.item}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Analytics */}
        {selectedMetric === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  {analyticsData.inventory.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(category.trend)}
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{category.count} items</p>
                        <p className="text-xs text-gray-500">{formatCurrency(category.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Trends */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.inventory.trends.monthly.map((value, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(value / 156) * 200}px` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{analyticsData.inventory.trends.labels[index]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">Monthly item count growth</p>
              </div>
            </div>
          </div>
        )}

        {/* Spending Analytics */}
        {selectedMetric === 'spending' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {analyticsData.spending.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{category.name}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(category.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Spending */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.spending.monthly.map((amount, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t"
                        style={{ height: `${(amount / 2100) * 200}px` }}
                      />
                      <span className="text-xs text-gray-500 mt-2">{analyticsData.inventory.trends.labels[index]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-600 mt-4">Monthly spending trends</p>
              </div>
            </div>

            {/* Savings and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Total Savings</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(analyticsData.spending.savings)}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Budget Utilization</h3>
                <p className="text-3xl font-bold text-blue-600">{formatPercentage(analyticsData.spending.budgetUtilization)}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Efficiency Score</h3>
                <p className="text-3xl font-bold text-purple-600">8.7/10</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Analytics */}
        {selectedMetric === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Performance */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium text-gray-900">{analyticsData.performance.responseTime}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium text-gray-900">{analyticsData.performance.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">User Satisfaction</span>
                    <span className="font-medium text-gray-900">{analyticsData.performance.userSatisfaction}/5</span>
                  </div>
                </div>
              </div>

              {/* Feature Usage */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Usage</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.performance.featureUsage).map(([feature, usage]) => (
                    <div key={feature} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 capitalize">{feature}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{usage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}