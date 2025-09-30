import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hybridStorage from '../../firebase/hybridStorage';

export default function DataAlerts() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts data from Firebase
  useEffect(() => {
    const loadAlertsData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await hybridStorage.getDataAlerts(currentUser.uid);
        if (response.success) {
          setAlerts(response.data || []);
        } else {
          console.error('Failed to load alerts:', response.error);
          setAlerts([]);
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlertsData();
  }, [currentUser]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading alerts...</p>
        </div>
      </div>
    );
  }

  const [insights, setInsights] = useState([]);

  const [reports, setReports] = useState([]);

  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showAddInsight, setShowAddInsight] = useState(false);

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'alert': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getInsightTypeColor = (type) => {
    switch (type) {
      case 'pattern': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
      case 'optimization': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'efficiency': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, acknowledged: true, status: 'resolved' }
        : alert
    ));
  };

  const deleteAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const deleteInsight = (insightId) => {
    setInsights(insights.filter(insight => insight.id !== insightId));
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'active').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const unacknowledged = alerts.filter(a => !a.acknowledged).length;
    
    return { total, active, resolved, unacknowledged };
  };

  const alertStats = getAlertStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-teal-600" />
                Data & Alerts
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor your home data, receive intelligent insights, and manage alerts
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddAlert(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Alert
              </button>
              <button
                onClick={() => setShowAddInsight(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Add Insight
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertStats.total}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 dark:text-red-400">{alertStats.active} Active</span>
              <span className="ml-2 text-gray-500">{alertStats.resolved} Resolved</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Insights</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              AI-powered recommendations
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reports</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{reports.length}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Scheduled & on-demand
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unacknowledged</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alertStats.unacknowledged}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Require attention
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', count: 0 },
                { id: 'alerts', label: 'Alerts', count: alerts.length },
                { id: 'insights', label: 'Insights', count: insights.length },
                { id: 'reports', label: 'Reports', count: reports.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Alerts */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-3">
                      {alerts.slice(0, 3).map((alert) => (
                        <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className={`p-2 rounded-full ${getAlertTypeColor(alert.type)}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{alert.createdAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Insights */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Insights</h3>
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight) => (
                        <div key={insight.id} className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg">
                          <div className={`p-2 rounded-full ${getInsightTypeColor(insight.type)}`}>
                            <Zap className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightTypeColor(insight.type)}`}>
                                {insight.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{insight.createdAt}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-left">
                      <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Generate Report</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Create custom data report</p>
                    </button>
                    <button className="p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-left">
                      <Bell className="w-8 h-8 text-red-600 mb-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">Manage Alerts</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Configure alert preferences</p>
                    </button>
                    <button className="p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-left">
                      <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-gray-900 dark:text-white">View Analytics</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Explore data trends</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alert Management</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Types</option>
                      <option>Warning</option>
                      <option>Alert</option>
                      <option>Info</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Status</option>
                      <option>Active</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${getAlertTypeColor(alert.type)}`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                                {alert.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Category: {alert.category}</span>
                              <span>Created: {alert.createdAt}</span>
                              <span>Status: {alert.status}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                              title="Acknowledge"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteAlert(alert.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Insights</h3>
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Types</option>
                      <option>Pattern</option>
                      <option>Optimization</option>
                      <option>Efficiency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightTypeColor(insight.type)}`}>
                              {insight.type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.impact)}`}>
                              {insight.impact} impact
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-3 rounded">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{insight.createdAt}</p>
                        </div>
                        
                        <button
                          onClick={() => deleteInsight(insight.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors ml-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Reports</h3>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    Generate New Report
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              report.status === 'ready' 
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                                : 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Type: {report.type} • Period: {report.period}
                          </p>
                          <div className="space-y-1 text-xs text-gray-500">
                            <div>Last generated: {report.lastGenerated}</div>
                            <div>Next scheduled: {report.nextScheduled}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {report.status === 'ready' && (
                            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Budget Warning"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Describe the alert..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddAlert(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Insight Modal */}
      {showAddInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Insight</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Insight Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Spending Pattern Detected"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Describe the insight..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="pattern">Pattern</option>
                    <option value="optimization">Optimization</option>
                    <option value="efficiency">Efficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Impact</label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddInsight(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Add Insight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
