import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Thermometer, 
  Cloud, 
  Wind, 
  Droplets,
  BarChart3,
  Download,
  Trash2,
  Calendar,
  MapPin
} from 'lucide-react';
import weatherDataStorage from '../services/WeatherDataStorage';

const WeatherAnalytics = ({ location, onClose, temperatureUnit = 'celsius' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [temperatureAnalysis, setTemperatureAnalysis] = useState(null);
  const [commonConditions, setCommonConditions] = useState([]);
  const [weatherTrends, setWeatherTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format temperature based on selected unit
  const formatTemp = (temp) => {
    if (temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9 / 5) + 32);
    }
    return Math.round(temp);
  };

  // Get temperature unit symbol
  const getTempUnit = () => {
    return temperatureUnit === 'fahrenheit' ? 'F' : 'C';
  };

  useEffect(() => {
    loadAnalytics();
  }, [location]);

  const loadAnalytics = () => {
    setIsLoading(true);
    try {
      // Get analytics data
      const analyticsData = weatherDataStorage.getAnalytics();
      setAnalytics(analyticsData);

      // Get temperature analysis
      const tempAnalysis = weatherDataStorage.getTemperatureAnalysis(location, 7);
      setTemperatureAnalysis(tempAnalysis);

      // Get common conditions
      const conditions = weatherDataStorage.getCommonConditions(location, 7);
      setCommonConditions(conditions);

      // Get weather trends
      const trends = weatherDataStorage.getWeatherTrends(location, 7);
      setWeatherTrends(trends);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = () => {
    try {
      const data = weatherDataStorage.exportData('csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-data-${location}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const clearOldData = () => {
    if (window.confirm('Are you sure you want to clear old weather data? This action cannot be undone.')) {
      weatherDataStorage.clearOldData();
      loadAnalytics();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] sidebar-modal-overlay">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto sidebar-modal-content">
          <div className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading analytics...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] sidebar-modal-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto sidebar-modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Location Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{location}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Data collected over the last 7 days
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Temperature Analysis */}
            {temperatureAnalysis && (
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Temperature</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average:</span>
                    <span className="font-semibold">{formatTemp(temperatureAnalysis.average)}°{getTempUnit()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Range:</span>
                    <span className="font-semibold">{formatTemp(temperatureAnalysis.minimum)}°{getTempUnit()} - {formatTemp(temperatureAnalysis.maximum)}°{getTempUnit()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                    <span className={`font-semibold ${
                      temperatureAnalysis.trend === 'rising' ? 'text-green-600' :
                      temperatureAnalysis.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {temperatureAnalysis.trend}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
                    <span className="font-semibold">{temperatureAnalysis.dataPoints}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Common Conditions */}
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Cloud className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Common Conditions</h3>
              </div>
              <div className="space-y-2">
                {commonConditions.length > 0 ? (
                  commonConditions.map((condition, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">{condition.condition}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${condition.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-8">{condition.percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No condition data available</p>
                )}
              </div>
            </div>

            {/* Global Stats */}
            {analytics && (
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Global Stats</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Requests:</span>
                    <span className="font-semibold">{analytics.global.totalRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
                    <span className="font-semibold">{weatherTrends.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                    <span className="font-semibold text-sm">
                      {analytics.global.lastUpdated ? 
                        new Date(analytics.global.lastUpdated).toLocaleDateString() : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Data Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Data</h3>
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Temperature</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Humidity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Wind</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {weatherTrends.slice(0, 10).map((trend, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(trend.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trend.data.current?.temperature ? `${formatTemp(trend.data.current.temperature)}°${getTempUnit()}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trend.data.current?.condition || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trend.data.current?.humidity || 'N/A'}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {trend.data.current?.windSpeed || 'N/A'} km/h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex space-x-3">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={clearOldData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Old Data</span>
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAnalytics;


