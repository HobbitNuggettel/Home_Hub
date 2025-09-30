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
    const [insights, setInsights] = useState([]);
    const [reports, setReports] = useState([]);
    const [showAddAlert, setShowAddAlert] = useState(false);
    const [showAddInsight, setShowAddInsight] = useState(false);

    // Load real data from Firebase
    useEffect(() => {
        const loadAlertsData = async () => {
            if (!currentUser) {
                setAlerts([]);
                setInsights([]);
                setReports([]);
                setIsLoading(false);
                return;
            }

        try {
            setIsLoading(true);
            const [alertsResponse, insightsResponse, reportsResponse] = await Promise.all([
                hybridStorage.getDataAlerts(currentUser.uid),
                hybridStorage.getDataInsights(currentUser.uid),
                hybridStorage.getDataReports(currentUser.uid)
        ]);

          if (alertsResponse.success) {
              setAlerts(alertsResponse.data || []);
          } else {
              console.error('Failed to load alerts:', alertsResponse.error);
              setAlerts([]);
          }

          if (insightsResponse.success) {
              setInsights(insightsResponse.data || []);
          } else {
              console.error('Failed to load insights:', insightsResponse.error);
              setInsights([]);
          }

              if (reportsResponse.success) {
                  setReports(reportsResponse.data || []);
              } else {
                  console.error('Failed to load reports:', reportsResponse.error);
                  setReports([]);
              }
          } catch (error) {
              console.error('Error loading alerts data:', error);
              setAlerts([]);
              setInsights([]);
              setReports([]);
          } finally {
              setIsLoading(false);
          }
      };

      loadAlertsData();
  }, [currentUser]);

    // Show loading state while authentication is being determined
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading alerts data...</p>
                </div>
            </div>
        );
    }

  const getAlertTypeColor = (type) => {
    switch (type) {
        case 'alert': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
        case 'warning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
        case 'info': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
        case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
        case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
        case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getInsightTypeColor = (type) => {
    switch (type) {
        case 'pattern': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
        case 'optimization': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
        case 'efficiency': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
        case 'anomaly': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

    const getReportStatusColor = (status) => {
        switch (status) {
            case 'ready': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
            case 'generating': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
            case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
            case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const handleAcknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

    const handleDismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

    const handleDismissInsight = (insightId) => {
    setInsights(insights.filter(insight => insight.id !== insightId));
  };

    const handleGenerateReport = (reportId) => {
        setReports(reports.map(report =>
            report.id === reportId ? { ...report, status: 'generating' } : report
        ));
        // Simulate report generation
        setTimeout(() => {
            setReports(reports.map(report =>
                report.id === reportId ? { ...report, status: 'ready', lastGenerated: new Date().toISOString() } : report
            ));
        }, 3000);
    };

    const stats = {
        totalAlerts: alerts.length,
        activeAlerts: alerts.filter(alert => alert.status === 'active').length,
        acknowledgedAlerts: alerts.filter(alert => alert.acknowledged).length,
        totalInsights: insights.length,
        totalReports: reports.length,
        readyReports: reports.filter(report => report.status === 'ready').length
  };

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                              <Bell className="w-8 h-8 text-blue-600" />
                              Data Alerts & Insights
              </h1>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                              Monitor your data and get intelligent insights
              </p>
            </div>
                      <div className="flex items-center gap-3">
              <button
                              onClick={() => setShowAddInsight(true)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                              Add Insight
              </button>
              <button
                              onClick={() => setShowAddAlert(true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                              <Plus className="w-4 h-4" />
                              Add Alert
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Alerts</p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAlerts}</p>
              </div>
                          <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Alerts</p>
                              <p className="text-2xl font-bold text-red-600">{stats.activeAlerts}</p>
              </div>
                          <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Insights</p>
                              <p className="text-2xl font-bold text-purple-600">{stats.totalInsights}</p>
              </div>
                          <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                          <div>
                              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reports Ready</p>
                              <p className="text-2xl font-bold text-green-600">{stats.readyReports}</p>
              </div>
                          <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
              <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
                      <nav className="-mb-px flex space-x-8">
              {[
                              { id: 'overview', name: 'Overview', icon: BarChart3 },
                              { id: 'alerts', name: 'Alerts', icon: Bell },
                              { id: 'insights', name: 'Insights', icon: Activity },
                              { id: 'reports', name: 'Reports', icon: PieChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                </button>
              ))}
            </nav>
          </div>
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert Types</h3>
                              <div className="space-y-3">
                                  {['alert', 'warning', 'info', 'success'].map(type => {
                                      const count = alerts.filter(alert => alert.type === type).length;
                                      const percentage = stats.totalAlerts > 0 ? (count / stats.totalAlerts) * 100 : 0;
                                      return (
                                          <div key={type} className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                                              <div className="flex items-center gap-2">
                                                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                      <div
                                                          className="bg-blue-600 h-2 rounded-full"
                                                          style={{ width: `${percentage}%` }}
                                                      ></div>
                          </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                            </div>
                        </div>
                      );
                  })}
                              </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insight Types</h3>
                              <div className="space-y-3">
                                  {['pattern', 'optimization', 'efficiency', 'anomaly'].map(type => {
                                      const count = insights.filter(insight => insight.type === type).length;
                                      const percentage = stats.totalInsights > 0 ? (count / stats.totalInsights) * 100 : 0;
                                      return (
                                          <div key={type} className="flex items-center justify-between">
                                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{type}</span>
                                              <div className="flex items-center gap-2">
                                                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                      <div
                                                          className="bg-purple-600 h-2 rounded-full"
                                                          style={{ width: `${percentage}%` }}
                                                      ></div>
                          </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                            </div>
                        </div>
                      );
                  })}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                  <div className="space-y-4">
                      {alerts.map(alert => (
                          <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${getAlertTypeColor(alert.type)}`}>
                                {alert.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                                {alert.type === 'info' && <Info className="w-5 h-5" />}
                                {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                        {alert.priority}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlertTypeColor(alert.type)}`}>
                                        {alert.type}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{alert.message}</p>
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {alert.createdAt}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bell className="w-4 h-4" />
                                        {alert.category}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!alert.acknowledged && (
                                <button
                                    onClick={() => handleAcknowledgeAlert(alert.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Acknowledge
                                </button>
                            )}
                            <button
                                onClick={() => handleDismissAlert(alert.id)}
                                className="p-2 text-gray-400 hover:text-red-600"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
                  </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                  <div className="space-y-4">
                      {insights.map(insight => (
                          <div key={insight.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${getInsightTypeColor(insight.type)}`}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInsightTypeColor(insight.type)}`}>
                                        {insight.type}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.impact)}`}>
                                        {insight.impact} impact
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        <strong>Recommendation:</strong> {insight.recommendation}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {insight.createdAt}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDismissInsight(insight.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
                  </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                  <div className="space-y-4">
                      {reports.map(report => (
                          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                              <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-3">{report.period}</p>
                                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Last: {report.lastGenerated}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Next: {report.nextScheduled}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {report.status === 'ready' && (
                                <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                                    Download
                                </button>
                            )}
                            {report.status === 'scheduled' && (
                                <button
                                    onClick={() => handleGenerateReport(report.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Generate
                                </button>
                            )}
                            {report.status === 'generating' && (
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                    Generating...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
                  </div>
              )}
          </div>
    </div>
  );
}
