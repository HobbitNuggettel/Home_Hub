import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Utensils, 
  Zap, 
  Activity, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeDebug from './ThemeDebug';

const Dashboard = React.memo(function Dashboard() {
  const auth = useAuth();
  const currentUser = auth?.currentUser;
  const userProfile = auth?.userProfile;
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app, this would come from your data sources
  const mockStats = {
    inventory: {
      total: 156,
      categories: 12,
      lowStock: 8,
      expired: 3,
      value: 15420.50
    },
    spending: {
      monthly: 1247.89,
      budget: 2000,
      remaining: 752.11,
      trend: 'down',
      percentage: 62.4
    },
    collaboration: {
      members: 4,
      active: 3,
      invitations: 1,
      lastActivity: '2 hours ago'
    },
    shopping: {
      lists: 3,
      items: 24,
      budget: 450,
      spent: 320
    },
    recipes: {
      total: 28,
      favorites: 12,
      planned: 5,
      lastAdded: '3 days ago'
    },
    automation: {
      devices: 8,
      active: 6,
      automations: 12,
      efficiency: 87
    }
  };

  const mockRecentActivity = [
    {
      id: 1,
      type: 'inventory',
      action: 'Item added',
      description: 'Coffee Maker added to Kitchen category',
      timestamp: '2 hours ago',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'spending',
      action: 'Expense recorded',
      description: 'Grocery shopping: $87.45',
      timestamp: '4 hours ago',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'collaboration',
      action: 'Member joined',
      description: 'Sarah accepted invitation',
      timestamp: '1 day ago',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      type: 'shopping',
      action: 'List created',
      description: 'Weekend shopping list created',
      timestamp: '1 day ago',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 5,
      type: 'recipe',
      action: 'Recipe saved',
      description: 'Chicken Tikka Masala added to favorites',
      timestamp: '2 days ago',
      icon: Utensils,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const mockUpcomingTasks = [
    {
      id: 1,
      title: 'Check expiry dates',
      description: 'Review items expiring this week',
      dueDate: 'Today',
      priority: 'high',
      category: 'inventory',
      completed: false
    },
    {
      id: 2,
      title: 'Monthly budget review',
      description: 'Analyze spending patterns and adjust budget',
      dueDate: 'Tomorrow',
      priority: 'medium',
      category: 'spending',
      completed: false
    },
    {
      id: 3,
      title: 'Smart home maintenance',
      description: 'Update device firmware and check connections',
      dueDate: 'This week',
      priority: 'low',
      category: 'automation',
      completed: false
    },
    {
      id: 4,
      title: 'Meal planning',
      description: 'Plan meals for next week and create shopping list',
      dueDate: 'This weekend',
      priority: 'medium',
      category: 'recipe',
      completed: false
    }
  ];

  // Memoized calculations
  const spendingProgress = useMemo(() => {
    const percentage = (mockStats.spending.monthly / mockStats.spending.budget) * 100;
    return Math.min(percentage, 100);
  }, [mockStats.spending.monthly, mockStats.spending.budget]);

  const lowStockAlerts = useMemo(() => {
    return mockStats.inventory.lowStock > 0;
  }, [mockStats.inventory.lowStock]);

  const expiredAlerts = useMemo(() => {
    return mockStats.inventory.expired > 0;
  }, [mockStats.inventory.expired]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'inventory': return Package;
      case 'spending': return DollarSign;
      case 'collaboration': return Users;
      case 'shopping': return ShoppingCart;
      case 'recipe': return Utensils;
      case 'automation': return Zap;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <ThemeDebug />
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">
                Welcome back, {userProfile?.displayName || currentUser?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
                Here&apos;s what&apos;s happening with your home today
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500 dark:text-dark-text-tertiary">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Dashboard sections">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'activity', label: 'Recent Activity', icon: Activity },
              { id: 'tasks', label: 'Upcoming Tasks', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  role="tab"
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Inventory Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${mockStats.inventory.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items</span>
                    <span className="font-medium">{mockStats.inventory.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Categories</span>
                    <span className="font-medium">{mockStats.inventory.categories}</span>
                  </div>
                  {lowStockAlerts && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">Low Stock</span>
                      <span className="font-medium text-yellow-600">{mockStats.inventory.lowStock}</span>
                    </div>
                  )}
                  {expiredAlerts && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Expired</span>
                      <span className="font-medium text-red-600">{mockStats.inventory.expired}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Spending Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Monthly Budget</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${mockStats.spending.percentage}%
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">${mockStats.spending.monthly}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-medium text-green-600">${mockStats.spending.remaining}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        spendingProgress > 80 ? 'bg-red-500' : 
                        spendingProgress > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${spendingProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Collaboration Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Members</p>
                    <p className="text-2xl font-bold text-gray-900">{mockStats.collaboration.members}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium text-green-600">{mockStats.collaboration.active}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Invitations</span>
                    <span className="font-medium">{mockStats.collaboration.invitations}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-medium">{mockStats.collaboration.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {(lowStockAlerts || expiredAlerts) && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  Important Alerts
                </h3>
                <div className="space-y-3">
                  {lowStockAlerts && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Package className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-yellow-800">
                          {mockStats.inventory.lowStock} items are running low on stock
                        </p>
                        <p className="text-sm text-yellow-600">
                          Consider reordering soon
                        </p>
                      </div>
                    </div>
                  )}
                  {expiredAlerts && (
                    <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Clock className="w-5 h-5 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-red-800">
                          {mockStats.inventory.expired} items have expired
                        </p>
                        <p className="text-sm text-red-600">
                          Review and dispose of expired items
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Add Item', icon: Plus, color: 'bg-blue-500 hover:bg-blue-600' },
                  { label: 'Record Expense', icon: DollarSign, color: 'bg-green-500 hover:bg-green-600' },
                  { label: 'Create List', icon: ShoppingCart, color: 'bg-orange-500 hover:bg-orange-600' },
                  { label: 'Add Recipe', icon: Utensils, color: 'bg-red-500 hover:bg-red-600' }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={`dashboard-action-${action.label.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                      className={`${action.color} text-white p-4 rounded-lg flex flex-col items-center space-y-2 transition-colors`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" role="tabpanel" id="activity-panel" aria-labelledby="activity-tab">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Latest actions across all features</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockRecentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="p-6 flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h3>
              <p className="text-sm text-gray-600">Tasks that need your attention</p>
            </div>
            <div className="divide-y divide-gray-200">
              {mockUpcomingTasks.map((task) => {
                const Icon = getCategoryIcon(task.category);
                return (
                  <div key={task.id} className="p-6 flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Due: {task.dueDate}
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Distribution</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Dashboard;
