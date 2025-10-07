import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Thermometer,
  Gauge,
  MapPin,
  Search,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Clock,
  Globe,
  Settings,
  Check,
  BarChart3
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import weatherService from '../services/WeatherService';
import locationService from '../services/LocationService';
import weatherStorageConfig from '../services/WeatherStorageConfig';
import WeatherAnalytics from './WeatherAnalytics';
import WeatherAPIComparisonComponent from './WeatherAPIComparison';

const WeatherDashboard = () => {
  const { colors, isDarkMode } = useTheme();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');
  const [locationInfo, setLocationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAPIComparison, setShowAPIComparison] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState(() => {
    return localStorage.getItem('weatherTemperatureUnit') || 'celsius';
  }); // 'celsius' or 'fahrenheit'

  // Fetch weather data with intelligent caching
  const fetchWeatherData = useCallback(async (loc) => {
    if (!loc) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use configurable storage service for intelligent caching and data persistence
      const weatherData = await weatherStorageConfig.getWeatherData(loc, weatherService, 10);
      
      if (weatherData) {
        setWeatherData(weatherData);
        setForecastData(weatherData);
        setAlerts(weatherData.alerts || []);
        
        // Save location to localStorage
        localStorage.setItem('weatherLocation', loc);
        
        console.log(`Weather data loaded for ${loc} with intelligent caching`);
      } else {
        throw new Error('Failed to fetch weather data');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Detect location from IP
  const detectLocationFromIP = useCallback(async () => {
    setIsDetectingLocation(true);
    try {
      const locationData = await locationService.getLocationFromIP();
      setLocationInfo(locationData);
      const weatherLocation = locationService.getWeatherLocation(locationData);
      setLocation(weatherLocation);
      await fetchWeatherData(weatherLocation);
    } catch (err) {
      console.error('IP location detection failed:', err);
      setError('Failed to detect your location. Using default location.');
      // Fallback to default
      setLocation('New York');
      await fetchWeatherData('New York');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [fetchWeatherData]);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const coords = `${latitude},${longitude}`;
          setLocation(coords);
          fetchWeatherData(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to New York if geolocation fails
          setLocation('New York');
          fetchWeatherData('New York');
        }
      );
    } else {
      // Default to New York if geolocation not supported
      setLocation('New York');
      fetchWeatherData('New York');
    }
  }, [fetchWeatherData]);

  // Load saved location or detect from IP
  useEffect(() => {
    const savedLocation = locationService.getUserLocation();
    if (savedLocation && savedLocation.isUserPreferred) {
      // Use user's preferred location
      setLocationInfo(savedLocation);
      const weatherLocation = locationService.getWeatherLocation(savedLocation);
      setLocation(weatherLocation);
      fetchWeatherData(weatherLocation);
    } else {
      // Try IP-based location detection first
      detectLocationFromIP();
    }
  }, [fetchWeatherData, detectLocationFromIP]);

  // Save current location as user's preferred location
  const saveCurrentLocation = useCallback(() => {
    if (locationInfo) {
      locationService.saveUserLocation(locationInfo);
      setShowLocationSettings(false);
    }
  }, [locationInfo]);

  // Clear user's preferred location
  const clearPreferredLocation = useCallback(() => {
    locationService.clearUserLocation();
    setLocationInfo(null);
    setShowLocationSettings(false);
    // Re-detect location from IP
    detectLocationFromIP();
  }, [detectLocationFromIP]);

  // Handle location selection from search
  const handleLocationSelect = useCallback((selectedLocation) => {
    const locationData = {
      city: selectedLocation.name,
      country: selectedLocation.country || '',
      region: selectedLocation.region || '',
      coordinates: selectedLocation.coordinates || null,
      ip: 'Unknown',
      timezone: selectedLocation.timezone || '',
      isp: 'Unknown'
    };
    
    setLocationInfo(locationData);
    const weatherLocation = locationService.getWeatherLocation(locationData);
    setLocation(weatherLocation);
    fetchWeatherData(weatherLocation);
    setShowSearch(false);
    setSearchQuery('');
  }, [fetchWeatherData]);

  // Search locations
  const searchLocations = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await weatherService.searchLocations(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Location search error:', err);
    }
  }, []);

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchLocations(query);
  };


  // Refresh weather data
  const refreshWeather = () => {
    if (location) {
      fetchWeatherData(location);
    }
  };

  // Get weather icon component
  const getWeatherIcon = (condition) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return Sun;
    if (conditionLower.includes('cloud')) return Cloud;
    if (conditionLower.includes('rain')) return CloudRain;
    if (conditionLower.includes('snow')) return CloudSnow;
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return CloudLightning;
    return Cloud;
  };

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

  // Get the unit symbol for the toggle button (shows what it will switch TO)
  const getToggleUnit = () => {
    return temperatureUnit === 'fahrenheit' ? 'C' : 'F';
  };

  // Toggle temperature unit
  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => {
      const newUnit = prev === 'celsius' ? 'fahrenheit' : 'celsius';
      localStorage.setItem('weatherTemperatureUnit', newUnit);
      return newUnit;
    });
  };

  // Format wind speed
  const formatWindSpeed = (speed) => {
    return Math.round(speed);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p className="text-gray-600 dark:text-gray-400">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Weather Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={refreshWeather}
            className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weather Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time weather data and forecasts</p>
            {locationInfo && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Globe className="w-4 h-4" />
                <span>{locationService.getLocationDisplayName(locationInfo)}</span>
                {locationService.isUserPreferred(locationInfo) && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Saved
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-0">
            {/* Location Management */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Temperature Unit Toggle */}
              <button
                onClick={toggleTemperatureUnit}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[60px]"
                title={`Switch to ${temperatureUnit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
              >
                <Thermometer className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  °{getToggleUnit()}
                </span>
              </button>

              <button
                onClick={() => setShowLocationSettings(!showLocationSettings)}
                className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[44px]"
                title="Location Settings"
              >
                <Settings className="w-4 h-4" style={{ color: colors.primary }} />
              </button>
              
              {isDetectingLocation ? (
                <button
                  disabled
                  className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md opacity-50"
                >
                  <RefreshCw className="w-4 h-4 animate-spin" style={{ color: colors.primary }} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Detecting...</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={detectLocationFromIP}
                      className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[100px]"
                    title="Detect My Location"
                  >
                    <Globe className="w-4 h-4" style={{ color: colors.primary }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Auto-detect</span>
                  </button>
                  
                  <button
                    onClick={() => setShowAnalytics(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[100px]"
                    title="View Weather Analytics"
                  >
                    <BarChart3 className="w-4 h-4" style={{ color: colors.primary }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Analytics</span>
                  </button>
                  
                  <button
                    onClick={() => setShowAPIComparison(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[120px]"
                    title="Compare Weather APIs"
                  >
                    <Settings className="w-4 h-4" style={{ color: colors.primary }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Compare APIs</span>
                  </button>
                </>
              )}
            </div>

            {/* Location Search */}
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow min-w-[150px]"
              >
                <MapPin className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-gray-700 dark:text-gray-300">{location || 'Select Location'}</span>
                <Search className="w-4 h-4 text-gray-400" />
              </button>
              
              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <input
                      type="text"
                      placeholder="Search for a location..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id || result.name}
                            onClick={() => handleLocationSelect(result)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{result.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {result.region || result.state}, {result.country}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refreshWeather}
              disabled={loading}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: colors.primary }} />
            </button>
          </div>
        </div>

        {/* Location Settings Modal */}
        {showLocationSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location Settings</h3>
                  <button
                    onClick={() => setShowLocationSettings(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {locationInfo && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Location</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {locationService.getLocationDisplayName(locationInfo)}
                        </span>
                      </div>
                      {locationInfo.ip && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          IP: {locationInfo.ip}
                        </div>
                      )}
                      {locationInfo.isp && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ISP: {locationInfo.isp}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={saveCurrentLocation}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save as Primary</span>
                  </button>
                  <button
                    onClick={clearPreferredLocation}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset to Auto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8">
            {alerts.map((alert, index) => (
              <div
                key={`alert-${alert.event}-${alert.headline || index}`}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"
              >
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-200">{alert.headline}</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">{alert.desc}</p>
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                      Effective: {new Date(alert.effective).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Weather */}
        {weatherData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Weather Card */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {weatherData.location.name}, {weatherData.location.country}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatTime(weatherData.current.lastUpdated)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-bold text-gray-900 dark:text-white">
                      {formatTemp(weatherData.current.temperature)}°{getTempUnit()}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Feels like {formatTemp(weatherData.current.feelsLike)}°{getTempUnit()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  {(() => {
                    const IconComponent = getWeatherIcon(weatherData.current.condition);
                    return (
                      <div className="text-center">
                        <IconComponent className="w-24 h-24 mx-auto mb-2" style={{ color: colors.primary }} />
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {weatherData.current.condition}
                        </p>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Wind className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Wind</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatWindSpeed(weatherData.current.windSpeed)} km/h
                    </p>
                  </div>
                  <div className="text-center">
                    <Droplets className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.current.humidity}%
                    </p>
                  </div>
                  <div className="text-center">
                    <Gauge className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pressure</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.current.pressure} mb
                    </p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.current.visibility} km
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Air Quality Card */}
            {weatherData.airQuality && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Air Quality</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">PM2.5</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.airQuality.pm2_5.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">PM10</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.airQuality.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">O₃</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.airQuality.o3.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">NO₂</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {weatherData.airQuality.no2.toFixed(1)} μg/m³
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecastData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">5-Day Forecast</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {forecastData.forecast.map((day, index) => {
                const IconComponent = getWeatherIcon(day.condition);
                return (
                  <div
                    key={`forecast-${day.date}-${day.condition || index}`}
                    className="text-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {formatDate(day.date)}
                    </p>
                    <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: colors.primary }} />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.condition}</p>
                    <div className="flex justify-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatTemp(day.maxTemp)}°{getTempUnit()}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatTemp(day.minTemp)}°{getTempUnit()}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-center space-x-1">
                        <Droplets className="w-3 h-3" />
                        <span>{day.precipitation}mm</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Weather Analytics Modal */}
        {showAnalytics && (
          <WeatherAnalytics 
            location={location} 
            onClose={() => setShowAnalytics(false)}
            temperatureUnit={temperatureUnit}
          />
        )}
        
        {/* Weather API Comparison Modal */}
        {showAPIComparison && (
          <WeatherAPIComparisonComponent 
            location={location} 
            onClose={() => setShowAPIComparison(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
