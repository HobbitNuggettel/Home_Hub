import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  Bell,
  Settings,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Warning,
  Activity,
  Database,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield,
  Users,
  Home,
  DollarSign,
  ShoppingCart,
  Utensils
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for charts
const mockChartData = {
  spending: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Groceries',
        data: [120, 150, 180, 140, 200, 160],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Utilities',
        data: [80, 90, 85, 95, 88, 92],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'Entertainment',
        data: [60, 70, 65, 75, 80, 70],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2
      }
    ]
  },
  inventory: {
    labels: ['Electronics', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage'],
    data: [45, 32, 28, 35, 42, 18],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)'
    ]
  },
  activity: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'User Logins',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Items Added',
        data: [8, 12, 10, 18, 15, 22, 20],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  }
};

// Mock alerts data
const mockAlerts = [
  {
    id: '1',
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'Milk quantity is below threshold (2 remaining)',
    category: 'inventory',
    priority: 'medium',
    status: 'active',
    createdAt: '2024-01-20T10:30:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: 'tom',
    source: 'inventory_system'
  },
  {
    id: '2',
    type: 'error',
    title: 'Budget Exceeded',
    message: 'Groceries spending exceeded monthly budget by $45',
    category: 'spending',
    priority: 'high',
    status: 'active',
    createdAt: '2024-01-20T09:15:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: null,
    source: 'spending_tracker'
  },
  {
    id: '3',
    type: 'info',
    title: 'New Recipe Available',
    message: 'You have all ingredients for Spaghetti Carbonara',
    category: 'recipes',
    priority: 'low',
    status: 'active',
    createdAt: '2024-01-20T08:45:00Z',
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: null,
    source: 'recipe_system'
  },
  {
    id: '4',
    type: 'success',
    title: 'Automation Completed',
    message: 'Good Morning routine executed successfully',
    category: 'automation',
    priority: 'low',
    status: 'resolved',
    createdAt: '2024-01-20T07:00:00Z',
    acknowledgedAt: '2024-01-20T07:01:00Z',
    resolvedAt: '2024-01-20T07:01:00Z',
    assignedTo: 'system',
    source: 'automation_engine'
  }
];

// Mock monitoring data
const mockMonitoringData = {
  systemHealth: {
    status: 'healthy',
    uptime: '99.8%',
    lastCheck: '2024-01-20T10:30:00Z',
    responseTime: '45ms'
  },
  database: {
    status: 'healthy',
    size: '2.4 GB',
    connections: 12,
    queries: '1.2k/min'
  },
  integrations: {
    status: 'healthy',
    connected: 5,
    total: 5,
    lastSync: '2024-01-20T10:25:00Z'
  },
  users: {
    active: 3,
    total: 3,
    lastActivity: '2024-01-20T10:28:00Z'
  }
};

const alertTypes = ['all', 'error', 'warning', 'info', 'success'];
const alertCategories = ['all', 'inventory', 'spending', 'recipes', 'automation', 'system'];
const alertPriorities = ['all', 'high', 'medium', 'low'];
const alertStatuses = ['all', 'active', 'acknowledged', 'resolved'];

export default function DataAlerts() {
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'alerts', 'monitoring', 'analytics'
  const [alerts, setAlerts] = useState(mockAlerts);
  const [monitoringData, setMonitoringData] = useState(mockMonitoringData);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showResolved, setShowResolved] = useState(true);

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || alert.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    const matchesResolved = showResolved || alert.status !== 'resolved';
    
    return matchesSearch && matchesType && matchesCategory && matchesPriority && matchesStatus && matchesResolved;
  });

  // Calculate alert statistics
  const totalAlerts = alerts.length;
  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;

  // Add new alert
  const addAlert = (alertData) => {
    const newAlert = {
      id: Date.now().toString(),
      ...alertData,
      status: 'active',
      createdAt: new Date().toISOString(),
      acknowledgedAt: null,
      resolvedAt: null,
      assignedTo: null
    };
    setAlerts([...alerts, newAlert]);
    setShowAddAlert(false);
    toast.success('Alert created successfully!');
  };

  // Update alert
  const updateAlert = (id, updates) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ));
    setEditingAlert(null);
    toast.success('Alert updated successfully!');
  };

  // Delete alert
  const deleteAlert = (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(alerts.filter(alert => alert.id !== id));
      toast.success('Alert deleted successfully!');
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'acknowledged', acknowledgedAt: new Date().toISOString() } : alert
    ));
    toast.success('Alert acknowledged!');
  };

  // Resolve alert
  const resolveAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() } : alert
    ));
    toast.success('Alert resolved!');
  };

  // Get alert type icon
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case 'error': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      case 'success': return CheckCircle;
      default: return Bell;
    }
  };

  // Get alert type color
  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'success': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Export data
  const exportData = (type) => {
    let data, filename;
    
    switch (type) {
      case 'alerts':
        data = JSON.stringify(alerts, null, 2);
        filename = 'home-hub-alerts.json';
        break;
      case 'monitoring':
        data = JSON.stringify(monitoringData, null, 2);
        filename = 'home-hub-monitoring.json';
        break;
      default:
        return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${type} data exported successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data & Alerts</h1>
              <p className="text-gray-600">Data visualization, alerts management, and system monitoring</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportData('alerts')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download size={20} />
                <span>Export Alerts</span>
              </button>
              <button
                onClick={() => setShowAddAlert(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Alert</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BarChart3 size={16} />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'alerts'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bell size={16} />
                <span>Alerts</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('monitoring')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'monitoring'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Activity size={16} />
                <span>Monitoring</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp size={16} />
                <span>Analytics</span>
              </div>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Bell className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertTriangle className="text-red-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{activeAlerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedAlerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Activity className="text-purple-600" size={24} />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">{monitoringData.systemHealth.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">User Logins</span>
                    <span className="font-medium">28 today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Items Added</span>
                    <span className="font-medium">20 today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Automations</span>
                    <span className="font-medium">3 executed</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Database</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Integrations</span>
                    <span className="text-green-600 font-medium">5/5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    View All Alerts
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                    Export Data
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    System Check
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trends</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 size={48} className="mx-auto mb-2" />
                    <p>Chart visualization would be here</p>
                    <p className="text-sm">Using Chart.js or similar library</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Distribution</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <PieChart size={48} className="mx-auto mb-2" />
                    <p>Pie chart would be here</p>
                    <p className="text-sm">Showing category distribution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'alerts' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Alerts</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by title or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {alertTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {alertCategories.map(category => (
                      <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedType('all');
                      setSelectedCategory('all');
                      setSelectedPriority('all');
                      setSelectedStatus('all');
                    }}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showResolved}
                    onChange={(e) => setShowResolved(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show resolved alerts</span>
                </label>
              </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.map(alert => {
                const AlertIcon = getAlertTypeIcon(alert.type);
                return (
                  <div key={alert.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertIcon className={`${getAlertTypeColor(alert.type).split(' ')[0]}`} size={20} />
                          <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAlertTypeColor(alert.type)}`}>
                            {alert.type}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{alert.message}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>Category: {alert.category}</span>
                          <span>Source: {alert.source}</span>
                          <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                          {alert.assignedTo && <span>Assigned to: {alert.assignedTo}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          onClick={() => setEditingAlert(alert)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                          title="Edit Alert"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                          title="Delete Alert"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'monitoring' && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    monitoringData.systemHealth.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Shield className={`${
                      monitoringData.systemHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`} size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">System Status</p>
                  <p className={`text-lg font-bold ${
                    monitoringData.systemHealth.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {monitoringData.systemHealth.status}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Activity className="text-blue-600" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Uptime</p>
                  <p className="text-lg font-bold text-blue-600">{monitoringData.systemHealth.uptime}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <Zap className="text-purple-600" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Response Time</p>
                  <p className="text-lg font-bold text-purple-600">{monitoringData.systemHealth.responseTime}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Clock className="text-orange-600" size={32} />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Last Check</p>
                  <p className="text-sm font-bold text-orange-600">
                    {new Date(monitoringData.systemHealth.lastCheck).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium">{monitoringData.database.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium">{monitoringData.database.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Connections</span>
                    <span className="font-medium">{monitoringData.database.connections}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Queries/min</span>
                    <span className="font-medium">{monitoringData.database.queries}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Integrations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium">{monitoringData.integrations.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Connected</span>
                    <span className="font-medium">{monitoringData.integrations.connected}/{monitoringData.integrations.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Sync</span>
                    <span className="font-medium">
                      {new Date(monitoringData.integrations.lastSync).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active</span>
                    <span className="font-medium">{monitoringData.users.active}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">{monitoringData.users.total}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Activity</span>
                    <span className="font-medium">
                      {new Date(monitoringData.users.lastActivity).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trends</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <LineChart size={48} className="mx-auto mb-2" />
                    <p>Line chart would be here</p>
                    <p className="text-sm">Monthly spending patterns</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Distribution</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <PieChart size={48} className="mx-auto mb-2" />
                    <p>Pie chart would be here</p>
                    <p className="text-sm">Category distribution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Export */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => exportData('alerts')}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export Alerts</span>
                </button>
                <button
                  onClick={() => exportData('monitoring')}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export Monitoring</span>
                </button>
                <button
                  onClick={() => exportData('analytics')}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
                >
                  <Download size={20} />
                  <span>Export Analytics</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Alert Modal */}
      {(showAddAlert || editingAlert) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const alertData = {
                  type: formData.get('type'),
                  title: formData.get('title'),
                  message: formData.get('message'),
                  category: formData.get('category'),
                  priority: formData.get('priority'),
                  source: formData.get('source')
                };
                
                if (editingAlert) {
                  updateAlert(editingAlert.id, alertData);
                } else {
                  addAlert(alertData);
                }
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
                      <select
                        name="type"
                        defaultValue={editingAlert?.type || 'info'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        defaultValue={editingAlert?.priority || 'medium'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingAlert?.title || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      name="message"
                      defaultValue={editingAlert?.message || ''}
                      rows="3"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        defaultValue={editingAlert?.category || 'system'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="inventory">Inventory</option>
                        <option value="spending">Spending</option>
                        <option value="recipes">Recipes</option>
                        <option value="automation">Automation</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <input
                        type="text"
                        name="source"
                        defaultValue={editingAlert?.source || 'manual'}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAlert(false);
                      setEditingAlert(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">← Back to Home</a>
      </div>
    </div>
  );
} 