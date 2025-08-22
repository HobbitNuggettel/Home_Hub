import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Trash2, 
  Settings as SettingsIcon,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  Utensils,
  Zap,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Mock notifications - in real app, these would come from your backend
  const mockNotifications = [
    {
      id: 1,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Coffee beans are running low. Consider reordering soon.',
      category: 'warning',
      priority: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      action: 'view_inventory',
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 2,
      type: 'spending',
      title: 'Budget Warning',
      message: 'You\'ve spent 80% of your monthly budget.',
      category: 'alert',
      priority: 'high',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: false,
      action: 'view_spending',
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 3,
      type: 'collaboration',
      title: 'New Member Joined',
      message: 'Sarah has accepted your household invitation.',
      category: 'info',
      priority: 'low',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      action: 'view_collaboration',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 4,
      type: 'shopping',
      title: 'Shopping List Updated',
      message: 'Weekend shopping list has been updated by John.',
      category: 'info',
      priority: 'low',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      action: 'view_shopping',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 5,
      type: 'recipe',
      title: 'Recipe Recommendation',
      message: 'Based on your inventory, try making Chicken Tikka Masala.',
      category: 'suggestion',
      priority: 'low',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      action: 'view_recipe',
      icon: Utensils,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 6,
      type: 'automation',
      title: 'Device Offline',
      message: 'Smart thermostat is currently offline. Check connection.',
      category: 'error',
      priority: 'high',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      action: 'view_automation',
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  useEffect(() => {
    // Simulate loading notifications
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtered notifications based on active tab and search
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(notification => notification.type === activeTab);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(notification => notification.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [notifications, activeTab, selectedCategory, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const highPriority = notifications.filter(n => n.priority === 'high').length;
    const today = notifications.filter(n => 
      n.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    return { total, unread, highPriority, today };
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
      toast.success('All notifications cleared');
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'alert': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'suggestion': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'inventory', label: 'Inventory', count: notifications.filter(n => n.type === 'inventory').length },
    { id: 'spending', label: 'Spending', count: notifications.filter(n => n.type === 'spending').length },
    { id: 'collaboration', label: 'Collaboration', count: notifications.filter(n => n.type === 'collaboration').length },
    { id: 'shopping', label: 'Shopping', count: notifications.filter(n => n.type === 'shopping').length },
    { id: 'recipe', label: 'Recipe', count: notifications.filter(n => n.type === 'recipe').length },
    { id: 'automation', label: 'Automation', count: notifications.filter(n => n.type === 'automation').length }
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'error', label: 'Errors' },
    { id: 'warning', label: 'Warnings' },
    { id: 'alert', label: 'Alerts' },
    { id: 'info', label: 'Information' },
    { id: 'suggestion', label: 'Suggestions' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">Stay updated with your home management alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Notification Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-400" />
                {stats.unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unread > 9 ? '9+' : stats.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                <p className="text-sm text-gray-500">Unread</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.highPriority}</p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                <p className="text-sm text-gray-500">Today</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Mark All Read
              </button>
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {filteredNotifications.length} of {notifications.length} notifications
              </span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No notifications match your current filters.'
                  : 'You\'re all caught up! Check back later for new updates.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                        <Icon className={`w-5 h-5 ${notification.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notification.category)}`}>
                                {notification.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeAgo(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Push Notifications</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Inventory Alerts</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Spending Alerts</span>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
