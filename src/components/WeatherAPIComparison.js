import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Thermometer,
  Cloud,
  Wind,
  Droplets,
  Sun,
  Shield,
  Eye,
  Clock,
  MapPin,
  RefreshCw
} from 'lucide-react';
import weatherAPIComparison from '../services/WeatherAPIComparison';

const WeatherAPIComparisonComponent = ({ location, onClose }) => {
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detailedComparison, setDetailedComparison] = useState(null);

  useEffect(() => {
    loadDetailedComparison();
  }, []);

  const loadDetailedComparison = () => {
    const comparison = weatherAPIComparison.getDetailedComparison();
    setDetailedComparison(comparison);
  };

  const runLiveComparison = async () => {
    if (!location) return;
    
    setIsLoading(true);
    try {
      // This would require the weatherService to be passed as a prop
      // For now, we'll show the static comparison
      const comparison = weatherAPIComparison.getDetailedComparison();
      setComparison(comparison);
    } catch (error) {
      console.error('Error running comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureIcon = (feature) => {
    if (feature.includes('✅')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (feature.includes('❌')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (feature.includes('⚠️')) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <div className="w-4 h-4" />;
  };

  const getFeatureText = (feature) => {
    // eslint-disable-next-line no-misleading-character-class
    return feature.replace(/[✅❌⚠️]/g, '').trim();
  };

  const renderFeatureComparison = (category, title, icon) => {
    const weatherAPIFeatures = detailedComparison?.weatherAPI?.features?.[category] || {};
    const openWeatherFeatures = detailedComparison?.openWeatherMap?.features?.[category] || {};

    return (
      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="space-y-3">
          {Object.keys(weatherAPIFeatures).map((feature) => (
            <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {getFeatureIcon(weatherAPIFeatures[feature])}
                  <span className="text-xs text-gray-600 dark:text-gray-400">WeatherAPI</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getFeatureIcon(openWeatherFeatures[feature])}
                  <span className="text-xs text-gray-600 dark:text-gray-400">OpenWeather</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] sidebar-modal-overlay">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto sidebar-modal-content">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather API Comparison</h2>
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

          {/* API Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* WeatherAPI.com */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">WeatherAPI.com</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Quality: High</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Free Tier</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,000 calls/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Forecast Days</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Air Quality</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weather Alerts</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Unique Features:</h4>
                <div className="space-y-1">
                  {detailedComparison?.weatherAPI?.uniqueFeatures?.slice(0, 3).map((feature, index) => (
                    <div key={`weatherapi-feature-${feature}`} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* OpenWeatherMap */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">OpenWeatherMap</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Quality: Good</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Free Tier</span>
                  <span className="font-semibold text-gray-900 dark:text-white">1,000 calls/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Forecast Days</span>
                  <span className="font-semibold text-gray-900 dark:text-white">5 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Air Quality</span>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weather Alerts</span>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Unique Features:</h4>
                <div className="space-y-1">
                  {detailedComparison?.openWeatherMap?.uniqueFeatures?.slice(0, 3).map((feature, index) => (
                    <div key={`openweathermap-feature-${feature}`} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feature Comparison */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Feature Comparison</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderFeatureComparison('currentWeather', 'Current Weather', <Thermometer className="w-5 h-5 text-blue-500" />)}
              {renderFeatureComparison('forecast', 'Forecast Data', <Clock className="w-5 h-5 text-green-500" />)}
              {renderFeatureComparison('airQuality', 'Air Quality', <Shield className="w-5 h-5 text-purple-500" />)}
              {renderFeatureComparison('alerts', 'Weather Alerts', <AlertTriangle className="w-5 h-5 text-red-500" />)}
              {renderFeatureComparison('location', 'Location Data', <MapPin className="w-5 h-5 text-indigo-500" />)}
            </div>
          </div>

          {/* Data Quality Scores */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Quality Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">WeatherAPI.com</h4>
                  <span className="text-2xl font-bold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Excellent data quality with comprehensive features
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">OpenWeatherMap</h4>
                  <span className="text-2xl font-bold text-orange-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div className="bg-orange-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Good basic data quality, limited advanced features
                </p>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Recommendation</h3>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Use WeatherAPI.com as primary</strong> for rich data including air quality, weather alerts, and detailed forecasts.
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Use OpenWeatherMap as fallback</strong> for reliability and 5-day forecast when WeatherAPI is unavailable.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This dual-API approach gives you the best of both worlds: comprehensive data when available, and reliable fallback when needed.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Both APIs provide similar basic weather data, but WeatherAPI offers significantly more features.
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

WeatherAPIComparisonComponent.propTypes = {
  location: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default WeatherAPIComparisonComponent;


