// Weather Storage Configuration Service
import weatherDataStorage from './WeatherDataStorage';
import firebaseWeatherStorage from './FirebaseWeatherStorage';

class WeatherStorageConfig {
  constructor() {
    this.storageType = this.getStoragePreference();
    this.storage = this.getStorageInstance();
  }

  // Get storage preference from localStorage or default to 'local'
  getStoragePreference() {
    try {
      return localStorage.getItem('weather-storage-type') || 'local';
    } catch (error) {
      console.warn('Could not read storage preference, defaulting to local:', error);
      return 'local';
    }
  }

  // Set storage preference
  setStoragePreference(type) {
    try {
      localStorage.setItem('weather-storage-type', type);
      this.storageType = type;
      this.storage = this.getStorageInstance();
      console.log(`Weather storage switched to: ${type}`);
    } catch (error) {
      console.error('Could not save storage preference:', error);
    }
  }

  // Get the appropriate storage instance
  getStorageInstance() {
    switch (this.storageType) {
      case 'firebase':
        return firebaseWeatherStorage;
      case 'local':
      default:
        return weatherDataStorage;
    }
  }

  // Get storage information
  getStorageInfo() {
    return {
      type: this.storageType,
      name: this.storageType === 'firebase' ? 'Firebase Firestore' : 'Local Storage',
      description: this.storageType === 'firebase' 
        ? 'Cloud-based storage with real-time sync and multi-device access'
        : 'Browser-based storage with offline capability and privacy',
      features: this.storageType === 'firebase' 
        ? ['Cloud sync', 'Multi-device access', 'Real-time updates', 'Scalable']
        : ['Offline access', 'Privacy-focused', 'No server costs', 'Fast access']
    };
  }

  // Check if Firebase is available
  isFirebaseAvailable() {
    try {
      return firebaseWeatherStorage.isAvailable();
    } catch (error) {
      return false;
    }
  }

  // Get available storage options
  getAvailableStorageOptions() {
    const options = [
      {
        id: 'local',
        name: 'Local Storage',
        description: 'Store data in your browser (offline, private)',
        available: true,
        icon: '💾'
      }
    ];

    if (this.isFirebaseAvailable()) {
      options.push({
        id: 'firebase',
        name: 'Firebase Firestore',
        description: 'Store data in the cloud (sync across devices)',
        available: true,
        icon: '☁️'
      });
    }

    return options;
  }

  // Delegate all storage methods to the current storage instance
  async saveWeatherData(location, weatherData) {
    return this.storage.saveWeatherData(location, weatherData);
  }

  async getWeatherData(location, weatherService, cacheMinutes = 10) {
    if (this.storageType === 'firebase') {
      return this.storage.getWeatherDataWithService(location, weatherService, cacheMinutes);
    } else {
      return this.storage.getWeatherData(location, weatherService, cacheMinutes);
    }
  }

  async getLatestData(location) {
    return this.storage.getLatestData(location);
  }

  async hasRecentData(location, cacheMinutes = 10) {
    return this.storage.hasRecentData(location, cacheMinutes);
  }

  async updateAnalytics(location, weatherData, timestamp) {
    return this.storage.updateAnalytics(location, weatherData, timestamp);
  }

  async getAnalytics(location, days = 7) {
    return this.storage.getAnalytics(location, days);
  }

  async getTemperatureAnalysis(location, days = 7) {
    return this.storage.getTemperatureAnalysis(location, days);
  }

  async clearOldData() {
    return this.storage.clearOldData();
  }

  async exportData(location, format = 'json') {
    return this.storage.exportData(location, format);
  }

  // Migration methods
  async migrateToFirebase() {
    if (!this.isFirebaseAvailable()) {
      throw new Error('Firebase is not available');
    }

    try {
      console.log('Starting migration from local storage to Firebase...');
      
      // Get all local data
      const localData = weatherDataStorage.getStoredData();
      const localAnalytics = weatherDataStorage.getAnalytics();
      
      // Migrate weather data
      for (const entry of localData) {
        await firebaseWeatherStorage.saveWeatherData(entry.location, entry.data);
      }
      
      // Migrate analytics data
      for (const [location, analytics] of Object.entries(localAnalytics.locations)) {
        if (analytics.temperatureHistory) {
          for (const tempEntry of analytics.temperatureHistory) {
            await firebaseWeatherStorage.updateAnalytics(location, {
              current: { temperature: tempEntry.temperature }
            }, tempEntry.timestamp);
          }
        }
      }
      
      // Switch to Firebase
      this.setStoragePreference('firebase');
      
      console.log(`Migration completed: ${localData.length} weather entries migrated`);
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async migrateToLocal() {
    try {
      console.log('Starting migration from Firebase to local storage...');
      
      // Get all Firebase data
      const firebaseData = await firebaseWeatherStorage.getWeatherData('all', 1000);
      
      // Migrate to local storage
      for (const entry of firebaseData) {
        weatherDataStorage.saveWeatherData(entry.location, entry.data);
      }
      
      // Switch to local
      this.setStoragePreference('local');
      
      console.log(`Migration completed: ${firebaseData.length} entries migrated to local storage`);
      return true;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

const weatherStorageConfig = new WeatherStorageConfig();
export default weatherStorageConfig;
