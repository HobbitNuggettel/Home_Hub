/**
 * LocationService - Handles IP-based location detection and user location management
 */

class LocationService {
  constructor() {
    this.cachedLocation = null;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get user's location based on IP address
   * @returns {Promise<Object>} Location object with city, country, coordinates
   */
  async getLocationFromIP() {
    try {
      // Try multiple IP geolocation services for better reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://api.ipify.org?format=json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          const data = await response.json();
          
          if (data.city && data.country) {
            const location = {
              city: data.city,
              country: data.country,
              region: data.region || data.regionName || '',
              coordinates: data.latitude && data.longitude ? 
                `${data.latitude},${data.longitude}` : null,
              ip: data.ip || 'Unknown',
              timezone: data.timezone || '',
              isp: data.org || data.isp || 'Unknown'
            };
            
            // Cache the location
            this.cachedLocation = {
              data: location,
              timestamp: Date.now()
            };
            
            return location;
          }
        } catch (error) {
          console.warn(`Location service ${service} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All location services failed');
    } catch (error) {
      console.error('IP location detection failed:', error);
      // Fallback to a default location
      return {
        city: 'New York',
        country: 'United States',
        region: 'New York',
        coordinates: '40.7128,-74.0060',
        ip: 'Unknown',
        timezone: 'America/New_York',
        isp: 'Unknown'
      };
    }
  }

  /**
   * Get cached location if still valid
   * @returns {Object|null} Cached location or null if expired
   */
  getCachedLocation() {
    if (this.cachedLocation && 
        Date.now() - this.cachedLocation.timestamp < this.cacheExpiry) {
      return this.cachedLocation.data;
    }
    return null;
  }

  /**
   * Save user's preferred location to localStorage
   * @param {Object} location - Location object to save
   */
  saveUserLocation(location) {
    try {
      const locationData = {
        ...location,
        isUserPreferred: true,
        savedAt: Date.now()
      };
      localStorage.setItem('homeHub-userLocation', JSON.stringify(locationData));
    } catch (error) {
      console.error('Failed to save user location:', error);
    }
  }

  /**
   * Get user's saved preferred location
   * @returns {Object|null} Saved location or null
   */
  getUserLocation() {
    try {
      const saved = localStorage.getItem('homeHub-userLocation');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
    return null;
  }

  /**
   * Clear user's saved location
   */
  clearUserLocation() {
    try {
      localStorage.removeItem('homeHub-userLocation');
      this.cachedLocation = null;
    } catch (error) {
      console.error('Failed to clear user location:', error);
    }
  }

  /**
   * Get location display name
   * @param {Object} location - Location object
   * @returns {string} Formatted location string
   */
  getLocationDisplayName(location) {
    if (!location) return 'Unknown Location';
    
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Get coordinates for weather API
   * @param {Object} location - Location object
   * @returns {string} Coordinates string or city name
   */
  getWeatherLocation(location) {
    if (!location) return 'New York';
    
    return location.coordinates || location.city;
  }

  /**
   * Check if location is user preferred
   * @param {Object} location - Location object
   * @returns {boolean} True if user preferred
   */
  isUserPreferred(location) {
    return location && location.isUserPreferred === true;
  }
}

const locationService = new LocationService();
export default locationService;


