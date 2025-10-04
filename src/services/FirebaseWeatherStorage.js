// Firebase Weather Data Storage Service
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc, Timestamp } from 'firebase/firestore';

// Optional Firebase import - will be null if Firebase is not configured
let db = null;
try {
  const firebaseConfig = require('../firebase/firebase');
  db = firebaseConfig.db;
} catch (error) {
  console.warn('Firebase not configured, FirebaseWeatherStorage will not be available');
}

class FirebaseWeatherStorage {
  constructor() {
    this.collectionName = 'weatherData';
    this.analyticsCollectionName = 'weatherAnalytics';
    this.maxStorageDays = 30;
  }

  // Check if Firebase is available
  isAvailable() {
    return db !== null;
  }

  // Save weather data to Firebase
  async saveWeatherData(location, weatherData) {
    if (!db) {
      throw new Error('Firebase is not configured');
    }

    try {
      const dataEntry = {
        location,
        data: weatherData,
        timestamp: Timestamp.now(),
        id: `${location}-${Date.now()}`,
        userId: this.getCurrentUserId() || 'anonymous'
      };

      const docRef = await addDoc(collection(db, this.collectionName), dataEntry);
      console.log(`Weather data saved to Firebase with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('Error saving weather data to Firebase:', error);
      throw error;
    }
  }

  // Get weather data from Firebase
  async getWeatherData(location, limitCount = 100) {
    if (!db) {
      throw new Error('Firebase is not configured');
    }

    try {
      const q = query(
        collection(db, this.collectionName),
        where('location', '==', location),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toISOString()
        });
      });

      return data;
    } catch (error) {
      console.error('Error getting weather data from Firebase:', error);
      return [];
    }
  }

  // Get latest weather data for a location
  async getLatestData(location) {
    try {
      const data = await this.getWeatherData(location, 1);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error getting latest data from Firebase:', error);
      return null;
    }
  }

  // Check if we have recent data (within cache time)
  async hasRecentData(location, cacheMinutes = 10) {
    try {
      const latest = await this.getLatestData(location);
      if (!latest) return false;
      
      const dataAge = Date.now() - new Date(latest.timestamp).getTime();
      const cacheTime = cacheMinutes * 60 * 1000;
      
      return dataAge < cacheTime;
    } catch (error) {
      console.error('Error checking recent data:', error);
      return false;
    }
  }

  // Get weather data (from cache or API)
  async getWeatherDataWithService(location, weatherService, cacheMinutes = 10) {
    try {
      // Check if we have recent cached data
      if (await this.hasRecentData(location, cacheMinutes)) {
        console.log(`Using cached Firebase weather data for ${location}`);
        const cached = await this.getLatestData(location);
        return cached.data;
      }

      // Fetch fresh data from API
      console.log(`Fetching fresh weather data for ${location}`);
      const freshData = await weatherService.getCompleteWeatherData(location);
      if (freshData) {
        await this.saveWeatherData(location, freshData);
        return freshData;
      }
    } catch (error) {
      console.error('Error in getWeatherDataWithService:', error);
      // Fallback to cached data if available
      const cached = await this.getLatestData(location);
      if (cached) {
        console.log('Using older cached data as fallback');
        return cached.data;
      }
      throw error;
    }
  }

  // Update analytics data in Firebase
  async updateAnalytics(location, weatherData, timestamp) {
    try {
      const analyticsData = {
        location,
        timestamp: Timestamp.now(),
        temperature: weatherData.current?.temperature || null,
        condition: weatherData.current?.condition || null,
        humidity: weatherData.current?.humidity || null,
        windSpeed: weatherData.current?.windSpeed || null,
        airQuality: weatherData.current?.airQuality || null,
        userId: this.getCurrentUserId() || 'anonymous'
      };

      await addDoc(collection(db, this.analyticsCollectionName), analyticsData);
    } catch (error) {
      console.error('Error updating analytics in Firebase:', error);
    }
  }

  // Get analytics data from Firebase
  async getAnalytics(location, days = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const q = query(
        collection(db, this.analyticsCollectionName),
        where('location', '==', location),
        where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate().toISOString()
        });
      });

      return data;
    } catch (error) {
      console.error('Error getting analytics from Firebase:', error);
      return [];
    }
  }

  // Get temperature analysis from Firebase data
  async getTemperatureAnalysis(location, days = 7) {
    try {
      const analytics = await this.getAnalytics(location, days);
      const temperatures = analytics
        .map(entry => entry.temperature)
        .filter(temp => temp !== null && temp !== undefined);
      
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
    } catch (error) {
      console.error('Error getting temperature analysis:', error);
      return null;
    }
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

  // Clear old data from Firebase
  async clearOldData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxStorageDays);
      
      // Get old weather data
      const weatherQuery = query(
        collection(db, this.collectionName),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );
      
      const weatherSnapshot = await getDocs(weatherQuery);
      const weatherDeletions = [];
      
      weatherSnapshot.forEach((doc) => {
        weatherDeletions.push(deleteDoc(doc.ref));
      });

      // Get old analytics data
      const analyticsQuery = query(
        collection(db, this.analyticsCollectionName),
        where('timestamp', '<', Timestamp.fromDate(cutoffDate))
      );
      
      const analyticsSnapshot = await getDocs(analyticsQuery);
      const analyticsDeletions = [];
      
      analyticsSnapshot.forEach((doc) => {
        analyticsDeletions.push(deleteDoc(doc.ref));
      });

      // Execute all deletions
      await Promise.all([...weatherDeletions, ...analyticsDeletions]);
      
      console.log(`Cleared ${weatherDeletions.length} weather records and ${analyticsDeletions.length} analytics records from Firebase`);
    } catch (error) {
      console.error('Error clearing old data from Firebase:', error);
    }
  }

  // Export data from Firebase
  async exportData(location, format = 'json') {
    try {
      const weatherData = await this.getWeatherData(location, 1000);
      const analyticsData = await this.getAnalytics(location, 30);
      
      const exportData = {
        weatherData,
        analyticsData,
        exportDate: new Date().toISOString(),
        totalWeatherEntries: weatherData.length,
        totalAnalyticsEntries: analyticsData.length,
        location
      };
      
      if (format === 'csv') {
        return this.convertToCSV(weatherData);
      }
      
      return exportData;
    } catch (error) {
      console.error('Error exporting data from Firebase:', error);
      return null;
    }
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
      entry.data?.current?.temperature || '',
      entry.data?.current?.condition || '',
      entry.data?.current?.humidity || '',
      entry.data?.current?.windSpeed || '',
      entry.data?.current?.pressure || '',
      entry.data?.current?.airQuality?.pm2_5 || '',
      entry.data?.current?.airQuality?.pm10 || ''
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Get current user ID (implement based on your auth system)
  getCurrentUserId() {
    // This should be implemented based on your authentication system
    // For now, return null for anonymous users
    return null;
  }
}

const firebaseWeatherStorage = new FirebaseWeatherStorage();
export default firebaseWeatherStorage;
