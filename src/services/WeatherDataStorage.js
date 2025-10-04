// Weather Data Storage and Analysis Service
class WeatherDataStorage {
  constructor() {
    this.storageKey = 'homeHub-weather-data';
    this.analyticsKey = 'homeHub-weather-analytics';
    this.maxStorageDays = 30; // Keep data for 30 days
  }

  // Save weather data with timestamp
  saveWeatherData(location, weatherData) {
    try {
      const timestamp = new Date().toISOString();
      const dataEntry = {
        location,
        data: weatherData,
        timestamp,
        id: `${location}-${Date.now()}`
      };

      // Get existing data
      const existingData = this.getStoredData();
      
      // Add new entry
      existingData.push(dataEntry);
      
      // Keep only last 30 days of data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxStorageDays);
      
      const filteredData = existingData.filter(entry => 
        new Date(entry.timestamp) > cutoffDate
      );
      
      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
      
      // Update analytics
      this.updateAnalytics(location, weatherData, timestamp);
      
      console.log(`Weather data saved for ${location} at ${timestamp}`);
      return true;
    } catch (error) {
      console.error('Error saving weather data:', error);
      return false;
    }
  }

  // Get stored weather data
  getStoredData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving stored data:', error);
      return [];
    }
  }

  // Get latest data for a location
  getLatestData(location) {
    const allData = this.getStoredData();
    const locationData = allData
      .filter(entry => entry.location === location)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return locationData.length > 0 ? locationData[0] : null;
  }

  // Check if we have recent data (within cache time)
  hasRecentData(location, cacheMinutes = 10) {
    const latest = this.getLatestData(location);
    if (!latest) return false;
    
    const dataAge = Date.now() - new Date(latest.timestamp).getTime();
    const cacheTime = cacheMinutes * 60 * 1000;
    
    return dataAge < cacheTime;
  }

  // Get weather data (from cache or API)
  async getWeatherData(location, weatherService, cacheMinutes = 10) {
    // Check if we have recent cached data
    if (this.hasRecentData(location, cacheMinutes)) {
      console.log(`Using cached weather data for ${location}`);
      const cached = this.getLatestData(location);
      return cached.data;
    }

    // Fetch fresh data from API
    console.log(`Fetching fresh weather data for ${location}`);
    try {
      // Get complete weather data (current + forecast)
      const freshData = await weatherService.getCompleteWeatherData(location);
      if (freshData) {
        this.saveWeatherData(location, freshData);
        return freshData;
      }
    } catch (error) {
      console.error('Error fetching fresh data:', error);
      // Fallback to cached data if available
      const cached = this.getLatestData(location);
      if (cached) {
        console.log('Using older cached data as fallback');
        return cached.data;
      }
      throw error;
    }
  }

  // Update analytics data
  updateAnalytics(location, weatherData, timestamp) {
    try {
      const analytics = this.getAnalytics();
      
      // Update location stats
      if (!analytics.locations[location]) {
        analytics.locations[location] = {
          name: location,
          firstSeen: timestamp,
          lastSeen: timestamp,
          totalRequests: 0,
          avgTemperature: 0,
          temperatureHistory: [],
          conditionHistory: [],
          airQualityHistory: []
        };
      }
      
      const locationStats = analytics.locations[location];
      locationStats.lastSeen = timestamp;
      locationStats.totalRequests++;
      
      // Track temperature trends
      if (weatherData.current && weatherData.current.temperature) {
        locationStats.temperatureHistory.push({
          temperature: weatherData.current.temperature,
          timestamp
        });
        
        // Keep only last 100 temperature readings
        if (locationStats.temperatureHistory.length > 100) {
          locationStats.temperatureHistory = locationStats.temperatureHistory.slice(-100);
        }
        
        // Calculate average temperature
        const temps = locationStats.temperatureHistory.map(h => h.temperature);
        locationStats.avgTemperature = temps.reduce((a, b) => a + b, 0) / temps.length;
      }
      
      // Track weather conditions
      if (weatherData.current && weatherData.current.condition) {
        locationStats.conditionHistory.push({
          condition: weatherData.current.condition,
          timestamp
        });
        
        // Keep only last 50 condition readings
        if (locationStats.conditionHistory.length > 50) {
          locationStats.conditionHistory = locationStats.conditionHistory.slice(-50);
        }
      }
      
      // Track air quality
      if (weatherData.current && weatherData.current.airQuality) {
        locationStats.airQualityHistory.push({
          pm2_5: weatherData.current.airQuality.pm2_5,
          pm10: weatherData.current.airQuality.pm10,
          timestamp
        });
        
        // Keep only last 50 air quality readings
        if (locationStats.airQualityHistory.length > 50) {
          locationStats.airQualityHistory = locationStats.airQualityHistory.slice(-50);
        }
      }
      
      // Update global stats
      analytics.global.totalRequests++;
      analytics.global.lastUpdated = timestamp;
      
      // Save analytics
      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics));
      
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  // Get analytics data
  getAnalytics() {
    try {
      const data = localStorage.getItem(this.analyticsKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error retrieving analytics:', error);
    }
    
    // Return default analytics structure
    return {
      global: {
        totalRequests: 0,
        lastUpdated: null,
        dataPoints: 0
      },
      locations: {}
    };
  }

  // Get weather trends for a location
  getWeatherTrends(location, days = 7) {
    const allData = this.getStoredData();
    const locationData = allData
      .filter(entry => entry.location === location)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return locationData.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
  }

  // Get temperature trend analysis
  getTemperatureAnalysis(location, days = 7) {
    const trends = this.getWeatherTrends(location, days);
    const temperatures = trends
      .map(trend => trend.data.current?.temperature)
      .filter(temp => temp !== undefined);
    
    if (temperatures.length === 0) return null;
    
    const avg = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const min = Math.min(...temperatures);
    const max = Math.max(...temperatures);
    
    return {
      average: Math.round(avg * 10) / 10,
      minimum: min,
      maximum: max,
      dataPoints: temperatures.length,
      trend: this.calculateTrend(temperatures)
    };
  }

  // Calculate trend direction
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (difference > 1) return 'rising';
    if (difference < -1) return 'falling';
    return 'stable';
  }

  // Get most common weather conditions
  getCommonConditions(location, days = 7) {
    const trends = this.getWeatherTrends(location, days);
    const conditions = trends
      .map(trend => trend.data.current?.condition)
      .filter(condition => condition !== undefined);
    
    const conditionCounts = {};
    conditions.forEach(condition => {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    });
    
    return Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([condition, count]) => ({
        condition,
        count,
        percentage: Math.round((count / conditions.length) * 100)
      }));
  }

  // Clear old data
  clearOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.maxStorageDays);
    
    const allData = this.getStoredData();
    const filteredData = allData.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
    console.log(`Cleared old weather data. Kept ${filteredData.length} entries.`);
  }

  // Export data for analysis
  exportData(format = 'json') {
    const data = this.getStoredData();
    const analytics = this.getAnalytics();
    
    const exportData = {
      weatherData: data,
      analytics,
      exportDate: new Date().toISOString(),
      totalEntries: data.length
    };
    
    if (format === 'csv') {
      // Convert to CSV format
      const csv = this.convertToCSV(data);
      return csv;
    }
    
    return exportData;
  }

  // Convert data to CSV
  convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = [
      'Location', 'Timestamp', 'Temperature', 'Condition', 'Humidity', 
      'Wind Speed', 'Pressure', 'PM2.5', 'PM10'
    ];
    
    const rows = data.map(entry => [
      entry.location,
      entry.timestamp,
      entry.data.current?.temperature || '',
      entry.data.current?.condition || '',
      entry.data.current?.humidity || '',
      entry.data.current?.windSpeed || '',
      entry.data.current?.pressure || '',
      entry.data.current?.airQuality?.pm2_5 || '',
      entry.data.current?.airQuality?.pm10 || ''
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }
}

const weatherDataStorage = new WeatherDataStorage();
export default weatherDataStorage;


