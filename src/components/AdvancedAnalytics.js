import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar,
  Filter,
  Download,
  Share,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Users,
  Home,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock chart component (in production, use Chart.js, Recharts, or similar)
const MockChart = ({ type, data, title, color = '#3b82f6' }) => {
  const getChartDisplay = () => {
    switch (type) {
      case 'line':
        return (
          <div className="h-40 flex items-end justify-between px-2">
            {data.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-2 rounded-t"
                  style={{ 
                    height: `${(value / Math.max(...data)) * 100}%`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        );
      case 'bar':
        return (
          <div className="h-40 flex items-end justify-between px-2 space-x-1">
            {data.map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full rounded-t max-w-8"
                  style={{ 
                    height: `${(value / Math.max(...data)) * 100}%`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                />
                <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
              </div>
            ))}
          </div>
        );
      case 'pie':
        const total = data.reduce((sum, val) => sum + val, 0);
        let currentAngle = 0;
        return (
          <div className="h-40 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                {data.map((value, index) => {
                  const percentage = (value / total) * 100;
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const strokeDashoffset = -currentAngle;
                  currentAngle += percentage;
                  
                  return (
                    <circle
                      key={index}
                      cx="18"
                      cy="18"
                      r="16"
                      fill="transparent"
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth="4"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">{total}</span>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-40 flex items-center justify-center text-gray-400">
            <BarChart3 size={32} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {getChartDisplay()}
    </div>
  );
};

// Analytics Dashboard
const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'
  const [selectedMetrics, setSelectedMetrics] = useState(['spending', 'inventory', 'activity']);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data generation
  const generateMockData = (days) => {
    return Array.from({ length: days }, (_, i) => Math.floor(Math.random() * 100) + 20);
  };

  const analyticsData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    return {
      spending: {
        data: generateMockData(days),
        total: 2847.32,
        change: 12.5,
        trend: 'up'
      },
      inventory: {
        data: generateMockData(days),
        total: 156,
        change: -3.2,
        trend: 'down'
      },
      activity: {
        data: generateMockData(days),
        total: 1249,
        change: 8.7,
        trend: 'up'
      },
      categories: {
        data: [45, 32, 28, 19, 15],
        labels: ['Food', 'Household', 'Electronics', 'Clothing', 'Other']
      },
      users: {
        data: [67, 33],
        labels: ['Active', 'Inactive']
      }
    };
  }, [timeRange]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExport = () => {
    // Simulate export functionality
    toast.success('Analytics data exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive insights into your home management data</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 border mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Metrics:</span>
                <div className="flex space-x-2">
                  {['spending', 'inventory', 'activity'].map(metric => (
                    <label key={metric} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 capitalize">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.spending.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {analyticsData.spending.trend === 'up' ? (
                <TrendingUp className="text-green-500" size={16} />
              ) : (
                <TrendingDown className="text-red-500" size={16} />
              )}
              <span className={`text-sm font-medium ml-2 ${
                analyticsData.spending.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(analyticsData.spending.change)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.inventory.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {analyticsData.inventory.trend === 'up' ? (
                <TrendingUp className="text-green-500" size={16} />
              ) : (
                <TrendingDown className="text-red-500" size={16} />
              )}
              <span className={`text-sm font-medium ml-2 ${
                analyticsData.inventory.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(analyticsData.inventory.change)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">User Activity</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.activity.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {analyticsData.activity.trend === 'up' ? (
                <TrendingUp className="text-green-500" size={16} />
              ) : (
                <TrendingDown className="text-red-500" size={16} />
              )}
              <span className={`text-sm font-medium ml-2 ${
                analyticsData.activity.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(analyticsData.activity.change)}% vs last period
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm font-medium text-green-600 ml-2">
                +5% vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {selectedMetrics.includes('spending') && (
            <MockChart
              type="line"
              data={analyticsData.spending.data}
              title="Spending Trends"
              color="#10b981"
            />
          )}
          
          {selectedMetrics.includes('inventory') && (
            <MockChart
              type="bar"
              data={analyticsData.inventory.data}
              title="Inventory Changes"
              color="#3b82f6"
            />
          )}
          
          {selectedMetrics.includes('activity') && (
            <MockChart
              type="line"
              data={analyticsData.activity.data}
              title="User Activity"
              color="#8b5cf6"
            />
          )}
          
          <MockChart
            type="pie"
            data={analyticsData.categories.data}
            title="Category Distribution"
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <div className="bg-white rounded-lg shadow-md p-6 border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Smart Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="text-blue-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-blue-900">Spending Optimization</p>
                  <p className="text-xs text-blue-700">
                    You've saved 15% on groceries this month by shopping at different stores.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Expiration Alert</p>
                  <p className="text-xs text-yellow-700">
                    5 items in your inventory will expire within the next week.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-green-900">Budget Performance</p>
                  <p className="text-xs text-green-700">
                    You're 12% under budget for this month. Great job!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-md p-6 border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Zap className="text-purple-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Smart Shopping</p>
                  <p className="text-xs text-gray-600">
                    Based on your consumption patterns, consider buying milk in bulk to save 8%.
                  </p>
                  <button className="text-xs text-purple-600 hover:text-purple-700 mt-1">
                    Apply suggestion →
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Home className="text-blue-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Storage Optimization</p>
                  <p className="text-xs text-gray-600">
                    Reorganize your pantry to reduce food waste by 20% based on usage patterns.
                  </p>
                  <button className="text-xs text-blue-600 hover:text-blue-700 mt-1">
                    View guide →
                  </button>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <ShoppingCart className="text-green-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Meal Planning</p>
                  <p className="text-xs text-gray-600">
                    Plan meals 3 days in advance to reduce grocery spending by 15%.
                  </p>
                  <button className="text-xs text-green-600 hover:text-green-700 mt-1">
                    Start planning →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;