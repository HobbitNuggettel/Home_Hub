/**
 * Analytics Dashboard Component
 * Displays analytics data and insights
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye, 
  Clock,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  Activity
} from 'lucide-react';
import { useAnalytics } from '../../contexts/AnalyticsContext.js';

const AnalyticsDashboard = () => {
  const { 
    analyticsData, 
    isInitialized, 
    isTrackingEnabled,
    toggleTracking,
    clearAnalyticsData 
  } = useAnalytics();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock analytics data for demonstration
  const mockAnalyticsData = {
    pageViews: 12543,
    uniqueVisitors: 3241,
    bounceRate: 23.5,
    avgSessionDuration: 245,
    topPages: [
      { page: '/', views: 3241, title: 'Home' },
      { page: '/inventory', views: 2156, title: 'Inventory' },
      { page: '/spending', views: 1892, title: 'Spending' },
      { page: '/analytics', views: 1456, title: 'Analytics' },
      { page: '/settings', views: 1234, title: 'Settings' }
    ],
    topEvents: [
      { event: 'button_click', count: 4567, description: 'Button Clicks' },
      { event: 'form_submission', count: 1234, description: 'Form Submissions' },
      { event: 'search', count: 890, description: 'Searches' },
      { event: 'navigation', count: 2345, description: 'Navigation' },
      { event: 'feature_usage', count: 1567, description: 'Feature Usage' }
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 65.2, count: 8156 },
      { device: 'Mobile', percentage: 28.7, count: 3598 },
      { device: 'Tablet', percentage: 6.1, count: 789 }
    ],
    trafficSources: [
      { source: 'Direct', percentage: 45.2, count: 5667 },
      { source: 'Search', percentage: 32.1, count: 4023 },
      { source: 'Social', percentage: 15.3, count: 1918 },
      { source: 'Referral', percentage: 7.4, count: 935 }
    ]
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const data = {
      analyticsData,
      mockData: mockAnalyticsData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Comprehensive insights into user behavior and app performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Tracking:</label>
                <button
                  onClick={() => toggleTracking(!isTrackingEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isTrackingEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isTrackingEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="overview">Overview</option>
                  <option value="pages">Pages</option>
                  <option value="events">Events</option>
                  <option value="devices">Devices</option>
                  <option value="sources">Traffic Sources</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Session ID: {analyticsData.sessionId}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {mockAnalyticsData.pageViews.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Visitors</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {mockAnalyticsData.uniqueVisitors.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {mockAnalyticsData.bounceRate}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Session</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.floor(mockAnalyticsData.avgSessionDuration / 60)}m {mockAnalyticsData.avgSessionDuration % 60}s
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Pages</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.topPages.map((page, index) => (
                  <div key={page.page} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {page.page}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.views.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Events</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.topEvents.map((event, index) => (
                  <div key={event.event} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.event}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">events</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Device Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.deviceBreakdown.map((device) => (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.device}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {device.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Traffic Sources</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAnalyticsData.trafficSources.map((source) => (
                  <div key={source.source} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {source.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Status */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analytics Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                analyticsData.isInitialized 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {analyticsData.isInitialized ? 'Initialized' : 'Not Initialized'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Service Status</p>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                analyticsData.isOnline 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {analyticsData.isOnline ? 'Online' : 'Offline'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Connection Status</p>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {analyticsData.queuedEvents + analyticsData.queuedPageViews}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Queued Events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;




