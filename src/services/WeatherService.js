import weatherConfig from '../config/weather';

class WeatherService {
  constructor() {
    this.apiKeys = {
      openWeatherMap: weatherConfig.openWeatherMap.key,
      weatherAPI: weatherConfig.weatherAPI.key,
    };
    this.baseUrls = {
      openWeatherMap: weatherConfig.openWeatherMap.baseUrl,
      weatherAPI: weatherConfig.weatherAPI.baseUrl,
    };
    this.currentProvider = 'weatherAPI'; // Default to WeatherAPI
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  // Get current weather data (alias for getWeatherData)
  async getCurrentWeather(location) {
    return this.getWeatherData(location);
  }

  // Get complete weather data (current + forecast)
  async getCompleteWeatherData(location) {
    try {
      // Get both current weather and forecast data
      const [currentData, forecastData] = await Promise.all([
        this.getWeatherData(location),
        this.getForecast(location, 5)
      ]);
      
      if (currentData && forecastData) {
        // Combine current and forecast data
        return {
          ...forecastData,
          current: currentData.current,
          location: currentData.location,
          airQuality: currentData.airQuality,
          provider: currentData.provider
        };
      } else if (currentData) {
        // Fallback to just current data if forecast fails
        return currentData;
      } else if (forecastData) {
        // Fallback to just forecast data if current fails
        return forecastData;
      }
      
      throw new Error('Unable to fetch weather data from any provider');
    } catch (error) {
      console.error('Error fetching complete weather data:', error);
      throw error;
    }
  }

  // Get weather data with enhanced fallback system
  async getWeatherData(location) {
    try {
      // Try primary provider first
      const primaryData = await this.fetchFromProvider(this.currentProvider, location);
      if (primaryData) {
        return this.formatWeatherData(primaryData, this.currentProvider);
      }
    } catch (error) {
      console.warn(`Primary provider ${this.currentProvider} failed:`, error.message);
    }

    // Try fallback provider
    const fallbackProvider = this.currentProvider === 'weatherAPI' ? 'openWeatherMap' : 'weatherAPI';
    try {
      const fallbackData = await this.fetchFromProvider(fallbackProvider, location);
      if (fallbackData) {
        console.log(`Using fallback provider: ${fallbackProvider}`);
        return this.formatWeatherData(fallbackData, fallbackProvider);
      }
    } catch (error) {
      console.warn(`Fallback provider ${fallbackProvider} failed:`, error.message);
    }

    throw new Error('All weather providers failed');
  }

  // Enhanced forecast with dual API support
  async getForecast(location, days = 3) {
    try {
      // Try WeatherAPI first (better forecast data)
      const weatherAPIData = await this.fetchFromProvider('weatherAPI', location, 'forecast');
      if (weatherAPIData) {
        return this.formatForecastData(weatherAPIData);
      }
    } catch (error) {
      console.warn('WeatherAPI forecast failed, trying OpenWeatherMap:', error.message);
    }

    try {
      // Fallback to OpenWeatherMap
      const openWeatherData = await this.fetchFromProvider('openWeatherMap', location, 'forecast');
      if (openWeatherData) {
        console.log('Using OpenWeatherMap for forecast data');
        return this.formatOpenWeatherForecastData(openWeatherData);
      }
    } catch (error) {
      console.warn('OpenWeatherMap forecast failed:', error.message);
    }

    throw new Error('All forecast providers failed');
  }

  // Format OpenWeatherMap forecast data
  formatOpenWeatherForecastData(data) {
    // Group hourly data by day
    const dailyData = {};
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          hourly: [],
          maxTemp: item.main.temp_max,
          minTemp: item.main.temp_min,
          conditions: []
        };
      }
      dailyData[date].hourly.push({
        time: item.dt_txt.split(' ')[1],
        temperature: item.main.temp,
        condition: item.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed * 3.6, // Convert m/s to km/h
        chanceOfRain: item.pop * 100
      });
      dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp);
      dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp);
      dailyData[date].conditions.push(item.weather[0].description);
    });

    // Get most common condition for each day
    Object.keys(dailyData).forEach(date => {
      const conditions = dailyData[date].conditions;
      const mostCommon = conditions.sort((a,b) =>
        conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
      ).pop();
      dailyData[date].condition = mostCommon;
    });

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        region: data.city.name,
        lat: data.city.coord.lat,
        lon: data.city.coord.lon,
        timezone: 'UTC'
      },
      current: {
        temperature: data.list[0].main.temp,
        feelsLike: data.list[0].main.feels_like,
        condition: data.list[0].weather[0].description,
        icon: `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`,
        humidity: data.list[0].main.humidity,
        windSpeed: data.list[0].wind.speed * 3.6,
        windDirection: data.list[0].wind.deg,
        pressure: data.list[0].main.pressure,
        visibility: data.list[0].visibility / 1000, // Convert m to km
        uvIndex: 0,
        lastUpdated: new Date(data.list[0].dt * 1000).toISOString(),
        airQuality: null // OpenWeatherMap doesn't provide air quality in free tier
      },
      forecast: Object.entries(dailyData).map(([date, dayData]) => ({
        date,
        maxTemp: dayData.maxTemp,
        minTemp: dayData.minTemp,
        condition: dayData.condition,
        icon: `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`,
        humidity: dayData.hourly[0]?.humidity || 0,
        windSpeed: dayData.hourly[0]?.windSpeed || 0,
        windDirection: 0,
        chanceOfRain: dayData.hourly[0]?.chanceOfRain || 0,
        chanceOfSnow: 0,
        uvIndex: 0,
        sunrise: '',
        sunset: '',
        moonPhase: '',
        hourly: dayData.hourly
      })),
      alerts: [] // OpenWeatherMap doesn't provide alerts in free tier
    };
  }

  // Fetch from specific provider with data type support
  async fetchFromProvider(provider, location, dataType = 'current') {
    const cacheKey = `${provider}-${location}-${dataType}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    let data;
    if (provider === 'weatherAPI') {
      data = await this.fetchFromWeatherAPI(location, dataType);
    } else {
      data = await this.fetchFromOpenWeatherMap(location, dataType);
    }

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  }

  // Fetch from WeatherAPI.com
  async fetchFromWeatherAPI(location, dataType = 'current') {
    const apiKey = this.apiKeys.weatherAPI;
    if (!apiKey) {
      throw new Error('WeatherAPI key not configured');
    }

    let url;
    if (dataType === 'forecast') {
      url = `${this.baseUrls.weatherAPI}/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&days=5&aqi=yes&alerts=yes`;
    } else {
      url = `${this.baseUrls.weatherAPI}/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=yes`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Fetch from OpenWeatherMap
  async fetchFromOpenWeatherMap(location, dataType = 'current') {
    const apiKey = this.apiKeys.openWeatherMap;
    if (!apiKey) {
      throw new Error('OpenWeatherMap key not configured');
    }

    let url;
    // Check if location is in coordinate format (lat,lon)
    const coordMatch = location.match(/^([-\d.]+),([-\d.]+)$/);
    
    if (coordMatch) {
      const [, lat, lon] = coordMatch;
      if (dataType === 'forecast') {
        url = `${this.baseUrls.openWeatherMap}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=40`;
      } else {
        url = `${this.baseUrls.openWeatherMap}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      }
    } else {
      if (dataType === 'forecast') {
        url = `${this.baseUrls.openWeatherMap}/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric&cnt=40`;
      } else {
        url = `${this.baseUrls.openWeatherMap}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
      }
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeatherMap error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Format weather data to consistent structure
  formatWeatherData(data, provider) {
    if (provider === 'weatherAPI') {
      return {
        location: {
          name: data.location.name,
          country: data.location.country,
          region: data.location.region,
        },
        current: {
          temperature: data.current.temp_c,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          windDirection: data.current.wind_dir,
          pressure: data.current.pressure_mb,
          uvIndex: data.current.uv,
          feelsLike: data.current.feelslike_c,
          visibility: data.current.vis_km,
          cloudCover: data.current.cloud,
          lastUpdated: data.current.last_updated,
        },
        airQuality: data.current.air_quality ? {
          co: data.current.air_quality.co,
          no2: data.current.air_quality.no2,
          o3: data.current.air_quality.o3,
          pm2_5: data.current.air_quality.pm2_5,
          pm10: data.current.air_quality.pm10,
          so2: data.current.air_quality.so2,
          usEpaIndex: data.current.air_quality['us-epa-index'],
          gbDefraIndex: data.current.air_quality['gb-defra-index'],
        } : null,
        provider: 'WeatherAPI',
      };
    } else {
      // OpenWeatherMap format
      return {
        location: {
          name: data.name,
          country: data.sys.country,
          region: data.sys.country,
        },
        current: {
          temperature: data.main.temp,
          condition: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
          windDirection: data.wind.deg,
          pressure: data.main.pressure,
          uvIndex: null,
          feelsLike: data.main.feels_like,
          visibility: data.visibility / 1000, // Convert m to km
          cloudCover: data.clouds.all,
          lastUpdated: new Date().toISOString(),
        },
        airQuality: null,
        provider: 'OpenWeatherMap',
      };
    }
  }


  // Format forecast data
  formatForecastData(data) {
    return {
      location: {
        name: data.location.name,
        country: data.location.country,
        region: data.location.region,
        lat: data.location.lat,
        lon: data.location.lon,
        timezone: data.location.tz_id,
      },
      current: {
        temperature: data.current.temp_c,
        feelsLike: data.current.feelslike_c,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph,
        windDirection: data.current.wind_dir,
        pressure: data.current.pressure_mb,
        visibility: data.current.vis_km,
        uvIndex: data.current.uv,
        lastUpdated: data.current.last_updated,
        airQuality: data.current.air_quality ? {
          pm2_5: data.current.air_quality.pm2_5,
          pm10: data.current.air_quality.pm10,
          o3: data.current.air_quality.o3,
          no2: data.current.air_quality.no2,
          so2: data.current.air_quality.so2,
          co: data.current.air_quality.co,
        } : null,
      },
      forecast: data.forecast.forecastday.map(day => ({
        date: day.date,
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        humidity: day.day.avghumidity,
        windSpeed: day.day.maxwind_kph,
        windDirection: day.day.avgvis_km,
        chanceOfRain: day.day.daily_chance_of_rain,
        chanceOfSnow: day.day.daily_chance_of_snow,
        uvIndex: day.day.uv,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset,
        moonPhase: day.astro.moon_phase,
        hourly: day.hour ? day.hour.map(hour => ({
          time: hour.time,
          temperature: hour.temp_c,
          condition: hour.condition.text,
          icon: hour.condition.icon,
          humidity: hour.humidity,
          windSpeed: hour.wind_kph,
          chanceOfRain: hour.chance_of_rain,
        })) : [],
      })),
      alerts: (data.alerts && Array.isArray(data.alerts.alert)) ? data.alerts.alert.map(alert => ({
        headline: alert.headline,
        description: alert.desc,
        severity: alert.severity,
        areas: alert.areas,
        start: alert.start,
        end: alert.end,
      })) : [],
      provider: 'WeatherAPI',
    };
  }

  // Search locations
  async searchLocations(query) {
    try {
      const apiKey = this.apiKeys.weatherAPI;
      if (!apiKey) {
        throw new Error('WeatherAPI key not configured');
      }

      const url = `${this.baseUrls.weatherAPI}/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Location search error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.map(location => ({
        id: location.id,
        name: location.name,
        country: location.country,
        region: location.region,
        lat: location.lat,
        lon: location.lon,
        url: location.url,
      }));
    } catch (error) {
      console.warn('Location search failed:', error.message);
      return [];
    }
  }

  // Get weather alerts
  async getWeatherAlerts(location) {
    try {
      const forecast = await this.getForecast(location, 1);
      return forecast ? forecast.alerts : [];
    } catch (error) {
      console.warn('Weather alerts fetch failed:', error.message);
      return [];
    }
  }

  // Set API keys
  setApiKeys(keys) {
    this.apiKeys = { ...this.apiKeys, ...keys };
  }

  // Set primary provider
  setPrimaryProvider(provider) {
    if (['weatherAPI', 'openWeatherMap'].includes(provider)) {
      this.currentProvider = provider;
    }
  }

  // Get service status
  getStatus() {
    return {
      providers: {
        weatherAPI: !!this.apiKeys.weatherAPI,
        openWeatherMap: !!this.apiKeys.openWeatherMap,
      },
      currentProvider: this.currentProvider,
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout,
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cached data
  getCachedData(location) {
    const cacheKey = `${this.currentProvider}-${location}`;
    const cached = this.cache.get(cacheKey);
    return cached ? cached.data : null;
  }
}

export default new WeatherService();