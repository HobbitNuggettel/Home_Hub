import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Activity, Database, Zap, TrendingUp, Cpu, Memory, 
  HardDrive, Network, Clock, BarChart3, Gauge, AlertTriangle 
} from 'lucide-react';
import { performanceMonitor, memoryMonitor } from '../utils/performance';
import { cacheService } from '../services/CacheService';

const PerformanceAnalytics = () => {
  const [performanceData, setPerformanceData] = useState({
    memory: [],
    cache: [],
    api: [],
    render: []
  });
  const [currentStats, setCurrentStats] = useState({
    memory: null,
    cache: null,
    system: null
  });
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringInterval = useRef(null);

  // Start performance monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    monitoringInterval.current = setInterval(() => {
      updatePerformanceData();
    }, 5000); // Update every 5 seconds
  };

  // Stop performance monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringInterval.current) {
      clearInterval(monitoringInterval.current);
      monitoringInterval.current = null;
    }
  };

  // Update performance data
  const updatePerformanceData = () => {
    const now = Date.now();
    
    // Memory data
    const memory = memoryMonitor.getMemoryInfo();
    if (memory) {
      setCurrentStats(prev => ({ ...prev, memory }));
      setPerformanceData(prev => ({
        ...prev,
        memory: [...prev.memory.slice(-19), { timestamp: now, ...memory }]
      }));
    }

    // Cache data
    const cacheStats = cacheService.getStats();
    setCurrentStats(prev => ({ ...prev, cache: cacheStats }));
    setPerformanceData(prev => ({
      ...prev,
      cache: [...prev.cache.slice(-19), { timestamp: now, ...cacheStats }]
    }));

    // System data
    const systemData = {
      timestamp: now,
      cpu: Math.random() * 100, // Mock CPU usage
      network: Math.random() * 1000, // Mock network activity
      disk: Math.random() * 100 // Mock disk usage
    };
    setPerformanceData(prev => ({
      ...prev,
      system: [...(prev.system || []).slice(-19), systemData]
    }));

    // Check for alerts
    checkAlerts(memory, cacheStats);
  };

  // Check for performance alerts
  const checkAlerts = (memory, cache) => {
    const newAlerts = [];
    
    if (memory) {
      if (memory.used / memory.limit > 0.9) {
        newAlerts.push({
          id: Date.now(),
          type: 'warning',
          message: 'Memory usage is high',
          details: `${memory.used}MB / ${memory.limit}MB`
        });
      }
    }

    if (cache && cache.hitRate < 50) {
      newAlerts.push({
        id: Date.now(),
        type: 'info',
        message: 'Cache hit rate is low',
        details: `Hit rate: ${cache.hitRate}`
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev.slice(-9), ...newAlerts]);
    }
  };

  // Format timestamp for charts
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Memory usage chart data
  const memoryChartData = performanceData.memory.map(item => ({
    time: formatTimestamp(item.timestamp),
    used: item.used,
    total: item.total,
    limit: item.limit
  }));

  // Cache performance chart data
  const cacheChartData = performanceData.cache.map(item => ({
    time: formatTimestamp(item.timestamp),
    hits: item.hits,
    misses: item.misses,
    hitRate: parseFloat(item.hitRate)
  }));

  // System performance chart data
  const systemChartData = performanceData.system?.map(item => ({
    time: formatTimestamp(item.timestamp),
    cpu: item.cpu,
    network: item.network,
    disk: item.disk
  })) || [];

  // Performance metrics cards
  const PerformanceCard = ({ title, value, unit, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}{unit}
          </p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Alert component
  const AlertItem = ({ alert }) => (
    <div className={`p-4 rounded-lg border-l-4 ${
      alert.type === 'warning' ? 'border-yellow-400 bg-yellow-50' :
      alert.type === 'error' ? 'border-red-400 bg-red-50' :
      'border-blue-400 bg-blue-50'
    }`}>
      <div className="flex items-center">
        <AlertTriangle className={`h-5 w-5 ${
          alert.type === 'warning' ? 'text-yellow-400' :
          alert.type === 'error' ? 'text-red-400' :
          'text-blue-400'
        }`} />
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">{alert.message}</p>
          <p className="text-sm text-gray-600">{alert.details}</p>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of system performance, memory usage, and cache efficiency
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isMonitoring 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </button>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isMonitoring ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Performance Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PerformanceCard
            title="Memory Usage"
            value={currentStats.memory?.used || 0}
            unit="MB"
            icon={Memory}
            color="bg-blue-500"
            trend={5.2}
          />
          <PerformanceCard
            title="Cache Hit Rate"
            value={currentStats.cache?.hitRate || '0%'}
            unit=""
            icon={Zap}
            color="bg-green-500"
            trend={-2.1}
          />
          <PerformanceCard
            title="Cache Size"
            value={currentStats.cache?.size || 0}
            unit=" items"
            icon={Database}
            color="bg-purple-500"
            trend={8.5}
          />
          <PerformanceCard
            title="System Load"
            value={systemChartData[systemChartData.length - 1]?.cpu?.toFixed(1) || 0}
            unit="%"
            icon={Cpu}
            color="bg-orange-500"
            trend={-1.3}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Memory Usage Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={memoryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="used" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Cache Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cacheChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hitRate" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="hits" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="misses" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={systemChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cpu" fill="#3B82F6" />
                <Bar dataKey="network" fill="#10B981" />
                <Bar dataKey="disk" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cache Distribution */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Hits', value: currentStats.cache?.hits || 0, fill: '#10B981' },
                    { name: 'Misses', value: currentStats.cache?.misses || 0, fill: '#EF4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No performance alerts at the moment</p>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Memory Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-medium">{currentStats.memory?.used || 0} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{currentStats.memory?.total || 0} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Limit:</span>
                  <span className="font-medium">{currentStats.memory?.limit || 0} MB</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cache Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hit Rate:</span>
                  <span className="font-medium">{currentStats.cache?.hitRate || '0%'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hits:</span>
                  <span className="font-medium">{currentStats.cache?.hits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Misses:</span>
                  <span className="font-medium">{currentStats.cache?.misses || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Size:</span>
                  <span className="font-medium">{currentStats.cache?.size || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">System Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>CPU Usage:</span>
                  <span className="font-medium">{systemChartData[systemChartData.length - 1]?.cpu?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-medium">{systemChartData[systemChartData.length - 1]?.network?.toFixed(0) || 0} MB/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Disk Usage:</span>
                  <span className="font-medium">{systemChartData[systemChartData.length - 1]?.disk?.toFixed(1) || 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
