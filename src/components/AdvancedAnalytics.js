import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter
} from 'recharts';
import {
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon,
  TrendingUp, Users, DollarSign, ShoppingCart, Calendar,
  Download, Filter, RefreshCw, Settings, Eye, EyeOff
} from 'lucide-react';
import * as d3 from 'd3';

// React Error Boundary Component
class AnalyticsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Analytics Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
              <p className="text-red-600 mb-6">
                The analytics dashboard encountered an error and couldn't load properly.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Chart wrapper component with error boundary
const ChartWrapper = ({ children, fallback = 'Chart failed to load' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>{fallback}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      {children}
    </ErrorBoundary>
  );
};

// Simple error boundary component
const ErrorBoundary = ({ children, onError }) => {
  useEffect(() => {
    const handleError = (error) => {
      console.error('Chart rendering error:', error);
      onError();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  return children;
};

/**
 * Advanced Analytics Dashboard Component
 * Comprehensive data visualization and analytics for Home Hub
 */
const AdvancedAnalytics = () => {
  const { currentUser } = useAuth();
  const { getRealTimeData } = useRealTime();

  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({});
  const [chartType, setChartType] = useState('bar');
  const [showRealTime, setShowRealTime] = useState(true);
  const [error, setError] = useState(null);

  const d3Container = useRef(null);

  // Sample data for demonstration
  const sampleData = {
    spending: [
      { month: 'Jan', groceries: 450, utilities: 120, entertainment: 80, total: 650 },
      { month: 'Feb', groceries: 380, utilities: 110, entertainment: 95, total: 585 },
      { month: 'Mar', groceries: 520, utilities: 125, entertainment: 70, total: 715 },
      { month: 'Apr', groceries: 410, utilities: 115, entertainment: 110, total: 635 },
      { month: 'May', groceries: 480, utilities: 130, entertainment: 85, total: 695 },
      { month: 'Jun', groceries: 390, utilities: 120, entertainment: 90, total: 600 }
    ],
    inventory: [
      { category: 'Electronics', count: 15, value: 2500, lowStock: 2 },
      { category: 'Kitchen', count: 45, value: 800, lowStock: 8 },
      { category: 'Clothing', count: 32, value: 1200, lowStock: 5 },
      { category: 'Books', count: 28, value: 400, lowStock: 3 },
      { category: 'Tools', count: 18, value: 600, lowStock: 4 }
    ],
    users: [
      { name: 'Family Members', count: 4, active: 3, lastActive: '2h ago' },
      { name: 'Guests', count: 2, active: 1, lastActive: '1d ago' },
      { name: 'Admin Users', count: 1, active: 1, lastActive: 'Now' }
    ],
    realTime: [
      { time: '09:00', users: 3, activities: 12, dataPoints: 45 },
      { time: '10:00', users: 4, activities: 18, dataPoints: 67 },
      { time: '11:00', users: 2, activities: 8, dataPoints: 23 },
      { time: '12:00', users: 5, activities: 25, dataPoints: 89 },
      { time: '13:00', users: 3, activities: 15, dataPoints: 56 },
      { time: '14:00', users: 4, activities: 20, dataPoints: 78 }
    ]
  };

  // Color schemes for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    success: '#22C55E',
    warning: '#F97316',
    info: '#06B6D4'
  };

  // Initialize analytics data
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Error setting analytics data:', error);
      setError('Failed to load analytics data');
      setAnalyticsData({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Safe chart type switching
  const handleChartTypeChange = (newType) => {
    try {
      setChartType(newType);
    } catch (error) {
      console.error('Error changing chart type:', error);
      setChartType('bar'); // Fallback to bar chart
    }
  };

  // Safe tab switching
  const handleTabChange = (tabId) => {
    try {
      setActiveTab(tabId);
    } catch (error) {
      console.error('Error changing tab:', error);
      setActiveTab('overview'); // Fallback to overview
    }
  };

  // Enhanced safe data access
  const getSafeData = (data, fallback = []) => {
    try {
      if (Array.isArray(data) && data.length > 0) {
        return data.filter(item => item !== null && item !== undefined);
      }
      return fallback;
    } catch (error) {
      console.error('Error accessing data:', error);
      return fallback;
    }
  };

  // D3.js Custom Visualization
  useEffect(() => {
    if (d3Container.current && analyticsData.inventory && analyticsData.inventory.length > 0) {
      try {
        const svg = d3.select(d3Container.current);
        if (!svg.empty()) {
          svg.selectAll('*').remove();

          const width = 400;
          const height = 300;
          const margin = { top: 20, right: 20, bottom: 30, left: 40 };

          const chartSvg = svg
            .append('svg')
            .attr('width', width)
            .attr('height', height);

          const x = d3.scaleBand()
            .domain(analyticsData.inventory.map(d => d.category))
            .range([margin.left, width - margin.right])
            .padding(0.1);

          const y = d3.scaleLinear()
            .domain([0, d3.max(analyticsData.inventory, d => d.value)])
            .range([height - margin.bottom, margin.top]);

          // Add bars
          chartSvg.selectAll('rect')
            .data(analyticsData.inventory)
            .enter()
            .append('rect')
            .attr('x', d => x(d.category))
            .attr('y', d => y(d.value))
            .attr('width', x.bandwidth())
            .attr('height', d => height - margin.bottom - y(d.value))
            .attr('fill', (d, i) => d3.schemeCategory10[i % d3.schemeCategory10.length])
            .attr('opacity', 0.8)
            .on('mouseover', function (event, d) {
              d3.select(this).attr('opacity', 1);
              // Add tooltip
              chartSvg.append('text')
                .attr('class', 'tooltip')
                .attr('x', x(d.category) + x.bandwidth() / 2)
                .attr('y', y(d.value) - 10)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white')
                .attr('font-weight', 'bold')
                .text(`$${d.value}`);
            })
            .on('mouseout', function () {
              d3.select(this).attr('opacity', 0.8);
              chartSvg.selectAll('.tooltip').remove();
            });

          // Add axes
          chartSvg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

          chartSvg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
        }
      } catch (error) {
        console.error('D3.js rendering error:', error);
        // Fallback to simple display if D3 fails
        if (d3Container.current) {
          d3Container.current.innerHTML = `
            <div class="text-center text-gray-500 p-8">
              <p>Chart rendering failed</p>
              <p class="text-sm">Please refresh the page</p>
            </div>
          `;
        }
      }
    }
  }, [analyticsData.inventory]);

  // Export analytics data
  const exportData = (format = 'json') => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `home-hub-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
  };

  // Refresh analytics data
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAnalyticsData(sampleData);
    setIsLoading(false);
  };

  // Calculate key metrics with safety checks
  const metrics = {
    totalSpending: getSafeData(analyticsData.spending).reduce((sum, item) => sum + (item.total || 0), 0),
    avgSpending: getSafeData(analyticsData.spending).reduce((sum, item) => sum + (item.total || 0), 0) / Math.max(getSafeData(analyticsData.spending).length, 1),
    totalInventory: getSafeData(analyticsData.inventory).reduce((sum, item) => sum + (item.count || 0), 0),
    inventoryValue: getSafeData(analyticsData.inventory).reduce((sum, item) => sum + (item.value || 0), 0),
    activeUsers: getSafeData(analyticsData.users).reduce((sum, item) => sum + (item.active || 0), 0),
    totalUsers: getSafeData(analyticsData.users).reduce((sum, item) => sum + (item.count || 0), 0)
  };

  return (
    <AnalyticsErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  📊 Advanced Analytics Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                  Data-driven insights for your Home Hub
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => exportData()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-800 hover:text-red-900 text-sm font-medium"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                <p className="ml-3 text-sm text-blue-800">Loading analytics data...</p>
              </div>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spending</p>
                  <p className="text-2xl font-bold text-gray-900">${metrics.totalSpending}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Last 6 months</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalInventory}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Total value: ${metrics.inventoryValue}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Out of {metrics.totalUsers} total</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Monthly Spend</p>
                  <p className="text-2xl font-bold text-gray-900">${Math.round(metrics.avgSpending)}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Per month average</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'spending', name: 'Spending Analytics', icon: DollarSign },
                  { id: 'inventory', name: 'Inventory Analytics', icon: ShoppingCart },
                  { id: 'users', name: 'User Analytics', icon: Users },
                  { id: 'realtime', name: 'Real-time Data', icon: TrendingUp }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Trends</h3>
                  {getSafeData(analyticsData.spending).length > 0 ? (
                    <ChartWrapper>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getSafeData(analyticsData.spending)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="total" stroke={colors.primary} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No spending data available</p>
                    </div>
                  )}
                </div>

                {/* Inventory Distribution */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
                  {getSafeData(analyticsData.inventory).length > 0 ? (
                    <ChartWrapper>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getSafeData(analyticsData.inventory)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {getSafeData(analyticsData.inventory).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={Object.values(colors)[index % Object.values(colors).length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No inventory data available</p>
                      </div>
                  )}
                </div>
              </div>
            )}

            {/* Spending Analytics Tab */}
            {activeTab === 'spending' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Spending Analysis</h3>
                    <div className="flex items-center space-x-2">
                      <select
                        value={chartType}
                        onChange={(e) => handleChartTypeChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="area">Area Chart</option>
                      </select>
                    </div>
                  </div>
                  {getSafeData(analyticsData.spending).length > 0 ? (
                    <ChartWrapper>
                      <div className="w-full h-96">
                        {chartType === 'bar' && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getSafeData(analyticsData.spending)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="groceries" fill={colors.primary} />
                              <Bar dataKey="utilities" fill={colors.secondary} />
                              <Bar dataKey="entertainment" fill={colors.accent} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                        {chartType === 'line' && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getSafeData(analyticsData.spending)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line type="monotone" dataKey="groceries" stroke={colors.primary} strokeWidth={2} />
                              <Line type="monotone" dataKey="utilities" stroke={colors.secondary} strokeWidth={2} />
                              <Line type="monotone" dataKey="entertainment" stroke={colors.accent} strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                        {chartType === 'area' && (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getSafeData(analyticsData.spending)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Area type="monotone" dataKey="groceries" stackId="1" stroke={colors.primary} fill={colors.primary} />
                              <Area type="monotone" dataKey="utilities" stackId="1" stroke={colors.secondary} fill={colors.secondary} />
                              <Area type="monotone" dataKey="entertainment" stackId="1" stroke={colors.accent} fill={colors.accent} />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </ChartWrapper>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No spending data available</p>
                      </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory Analytics Tab */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">D3.js Custom Visualization</h3>
                  <div ref={d3Container} className="flex justify-center"></div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Overview</h3>
                  {getSafeData(analyticsData.inventory).length > 0 ? (
                    <ChartWrapper>
                      <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={getSafeData(analyticsData.inventory)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="count" fill={colors.primary} />
                          <Line yAxisId="right" type="monotone" dataKey="value" stroke={colors.danger} strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No inventory data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Analytics Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Overview</h3>
                  {getSafeData(analyticsData.users).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {getSafeData(analyticsData.users).map((user, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <p className="text-2xl font-bold text-blue-600">{user.count}</p>
                          <p className="text-sm text-gray-500">Active: {user.active}</p>
                          <p className="text-xs text-gray-400">{user.lastActive}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No user data available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Real-time Data Tab */}
            {activeTab === 'realtime' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Real-time Activity Monitor</h3>
                    <button
                      onClick={() => setShowRealTime(!showRealTime)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {showRealTime ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showRealTime ? 'Hide' : 'Show'} Real-time</span>
                    </button>
                  </div>
                  {getSafeData(analyticsData.realTime).length > 0 ? (
                    <ChartWrapper>
                      <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart data={getSafeData(analyticsData.realTime)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Scatter name="Users" dataKey="users" fill={colors.primary} />
                          <Scatter name="Activities" dataKey="activities" fill={colors.secondary} />
                          <Scatter name="Data Points" dataKey="dataPoints" fill={colors.accent} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <p>No real-time data available</p>
                      </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnalyticsErrorBoundary>
  );
};

export default AdvancedAnalytics;