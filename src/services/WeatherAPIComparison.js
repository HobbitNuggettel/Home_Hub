// Weather API Data Comparison Service
class WeatherAPIComparison {
  constructor() {
    this.comparison = {
      weatherAPI: {
        name: 'WeatherAPI.com',
        freeTier: '1000 calls/day',
        dataQuality: 'High',
        features: {
          currentWeather: {
            temperature: '✅ Celsius',
            feelsLike: '✅ Yes',
            condition: '✅ Detailed text',
            icon: '✅ High quality',
            humidity: '✅ Percentage',
            windSpeed: '✅ km/h',
            windDirection: '✅ Cardinal + degrees',
            pressure: '✅ mb/hPa',
            visibility: '✅ km',
            uvIndex: '✅ UV index',
            cloudCover: '✅ Percentage',
            lastUpdated: '✅ ISO timestamp'
          },
          forecast: {
            days: '✅ Up to 3 days (free)',
            hourly: '✅ 24-hour data',
            maxTemp: '✅ Daily max',
            minTemp: '✅ Daily min',
            chanceOfRain: '✅ Percentage',
            chanceOfSnow: '✅ Percentage',
            sunrise: '✅ Time',
            sunset: '✅ Time',
            moonPhase: '✅ Phase info'
          },
          airQuality: {
            pm2_5: '✅ µg/m³',
            pm10: '✅ µg/m³',
            o3: '✅ µg/m³',
            no2: '✅ µg/m³',
            so2: '✅ µg/m³',
            co: '✅ mg/m³',
            usEpaIndex: '✅ US EPA index',
            gbDefraIndex: '✅ UK DEFRA index'
          },
          alerts: {
            weatherAlerts: '✅ Severe weather warnings',
            headline: '✅ Alert title',
            description: '✅ Detailed description',
            severity: '✅ Alert level',
            areas: '✅ Affected areas',
            effective: '✅ Start time',
            expires: '✅ End time'
          },
          location: {
            name: '✅ City name',
            country: '✅ Country',
            region: '✅ State/Region',
            coordinates: '✅ Lat/Lon',
            timezone: '✅ Timezone ID'
          }
        },
        uniqueFeatures: [
          'Air quality data (PM2.5, PM10, O3, NO2, SO2, CO)',
          'Weather alerts and warnings',
          'Astronomy data (sunrise, sunset, moon phase)',
          'UV index information',
          'Detailed forecast with hourly data',
          'Multiple air quality indices (US EPA, UK DEFRA)',
          'Comprehensive location data'
        ],
        limitations: [
          '3-day forecast limit on free tier',
          '1000 calls per day limit',
          'No historical data on free tier'
        ]
      },
      openWeatherMap: {
        name: 'OpenWeatherMap',
        freeTier: '1000 calls/day',
        dataQuality: 'Good',
        features: {
          currentWeather: {
            temperature: '✅ Celsius',
            feelsLike: '✅ Yes',
            condition: '✅ Basic description',
            icon: '✅ Good quality',
            humidity: '✅ Percentage',
            windSpeed: '✅ m/s (converted to km/h)',
            windDirection: '✅ Degrees only',
            pressure: '✅ hPa',
            visibility: '✅ meters (converted to km)',
            uvIndex: '❌ Not available (free tier)',
            cloudCover: '✅ Percentage',
            lastUpdated: '✅ Unix timestamp'
          },
          forecast: {
            days: '✅ Up to 5 days (free)',
            hourly: '✅ 3-hour intervals',
            maxTemp: '✅ Daily max',
            minTemp: '✅ Daily min',
            chanceOfRain: '✅ Probability',
            chanceOfSnow: '✅ Probability',
            sunrise: '❌ Not in forecast',
            sunset: '❌ Not in forecast',
            moonPhase: '❌ Not available'
          },
          airQuality: {
            pm2_5: '❌ Not available (free tier)',
            pm10: '❌ Not available (free tier)',
            o3: '❌ Not available (free tier)',
            no2: '❌ Not available (free tier)',
            so2: '❌ Not available (free tier)',
            co: '❌ Not available (free tier)',
            usEpaIndex: '❌ Not available (free tier)',
            gbDefraIndex: '❌ Not available (free tier)'
          },
          alerts: {
            weatherAlerts: '❌ Not available (free tier)',
            headline: '❌ Not available (free tier)',
            description: '❌ Not available (free tier)',
            severity: '❌ Not available (free tier)',
            areas: '❌ Not available (free tier)',
            effective: '❌ Not available (free tier)',
            expires: '❌ Not available (free tier)'
          },
          location: {
            name: '✅ City name',
            country: '✅ Country code',
            region: '❌ Not available',
            coordinates: '✅ Lat/Lon',
            timezone: '❌ Not available (free tier)'
          }
        },
        uniqueFeatures: [
          '5-day forecast (vs 3-day for WeatherAPI)',
          'More frequent updates',
          'Global coverage',
          'Historical data available (paid)',
          'One Call API with comprehensive data (paid)'
        ],
        limitations: [
          'No air quality data on free tier',
          'No weather alerts on free tier',
          'No astronomy data on free tier',
          'No UV index on free tier',
          'Limited location details',
          '3-hour forecast intervals (not hourly)'
        ]
      }
    };
  }

  // Get detailed comparison
  getDetailedComparison() {
    return this.comparison;
  }

  // Get data differences for a specific location
  async compareAPIsForLocation(location, weatherService) {
    try {
      console.log(`Comparing APIs for location: ${location}`);
      
      // Fetch from both APIs
      const [weatherAPIData, openWeatherData] = await Promise.allSettled([
        weatherService.fetchFromProvider('weatherAPI', location, 'forecast'),
        weatherService.fetchFromProvider('openWeatherMap', location, 'forecast')
      ]);

      const comparison = {
        location,
        timestamp: new Date().toISOString(),
        weatherAPI: {
          success: weatherAPIData.status === 'fulfilled',
          data: weatherAPIData.status === 'fulfilled' ? weatherAPIData.value : null,
          error: weatherAPIData.status === 'rejected' ? weatherAPIData.reason.message : null
        },
        openWeatherMap: {
          success: openWeatherData.status === 'fulfilled',
          data: openWeatherData.status === 'fulfilled' ? openWeatherData.value : null,
          error: openWeatherData.status === 'rejected' ? openWeatherData.reason.message : null
        }
      };

      // Analyze differences if both succeeded
      if (comparison.weatherAPI.success && comparison.openWeatherMap.success) {
        comparison.analysis = this.analyzeDataDifferences(
          comparison.weatherAPI.data,
          comparison.openWeatherMap.data
        );
      }

      return comparison;
    } catch (error) {
      console.error('Error comparing APIs:', error);
      return { error: error.message };
    }
  }

  // Analyze differences between API responses
  analyzeDataDifferences(weatherAPIData, openWeatherData) {
    const analysis = {
      currentWeather: {
        temperature: {
          weatherAPI: weatherAPIData.current?.temp_c,
          openWeather: openWeatherData.list?.[0]?.main?.temp,
          difference: null
        },
        condition: {
          weatherAPI: weatherAPIData.current?.condition?.text,
          openWeather: openWeatherData.list?.[0]?.weather?.[0]?.description,
          different: false
        },
        humidity: {
          weatherAPI: weatherAPIData.current?.humidity,
          openWeather: openWeatherData.list?.[0]?.main?.humidity,
          difference: null
        },
        windSpeed: {
          weatherAPI: weatherAPIData.current?.wind_kph,
          openWeather: openWeatherData.list?.[0]?.wind?.speed * 3.6,
          difference: null
        }
      },
      forecast: {
        daysAvailable: {
          weatherAPI: weatherAPIData.forecast?.forecastday?.length || 0,
          openWeather: Math.ceil((openWeatherData.list?.length || 0) / 8),
          difference: null
        },
        hourlyData: {
          weatherAPI: weatherAPIData.forecast?.forecastday?.[0]?.hour?.length || 0,
          openWeather: openWeatherData.list?.length || 0,
          difference: null
        }
      },
      uniqueFeatures: {
        airQuality: {
          weatherAPI: weatherAPIData.current?.air_quality ? 'Available' : 'Not available',
          openWeather: 'Not available (free tier)'
        },
        alerts: {
          weatherAPI: weatherAPIData.alerts?.length > 0 ? 'Available' : 'Not available',
          openWeather: 'Not available (free tier)'
        },
        uvIndex: {
          weatherAPI: weatherAPIData.current?.uv ? 'Available' : 'Not available',
          openWeather: 'Not available (free tier)'
        }
      }
    };

    // Calculate differences
    if (analysis.currentWeather.temperature.weatherAPI && analysis.currentWeather.temperature.openWeather) {
      analysis.currentWeather.temperature.difference = 
        Math.abs(analysis.currentWeather.temperature.weatherAPI - analysis.currentWeather.temperature.openWeather);
    }

    if (analysis.currentWeather.humidity.weatherAPI && analysis.currentWeather.humidity.openWeather) {
      analysis.currentWeather.humidity.difference = 
        Math.abs(analysis.currentWeather.humidity.weatherAPI - analysis.currentWeather.humidity.openWeather);
    }

    if (analysis.currentWeather.windSpeed.weatherAPI && analysis.currentWeather.windSpeed.openWeather) {
      analysis.currentWeather.windSpeed.difference = 
        Math.abs(analysis.currentWeather.windSpeed.weatherAPI - analysis.currentWeather.windSpeed.openWeather);
    }

    analysis.currentWeather.condition.different = 
      analysis.currentWeather.condition.weatherAPI !== analysis.currentWeather.condition.openWeather;

    analysis.forecast.daysAvailable.difference = 
      analysis.forecast.daysAvailable.weatherAPI - analysis.forecast.daysAvailable.openWeather;

    analysis.forecast.hourlyData.difference = 
      analysis.forecast.hourlyData.weatherAPI - analysis.forecast.hourlyData.openWeather;

    return analysis;
  }

  // Get recommendation for which API to use
  getRecommendation(useCase) {
    const recommendations = {
      'comprehensive': {
        primary: 'weatherAPI',
        reason: 'WeatherAPI provides air quality, alerts, UV index, and detailed forecast data',
        features: ['Air quality', 'Weather alerts', 'UV index', 'Astronomy data']
      },
      'basic': {
        primary: 'openWeatherMap',
        reason: 'OpenWeatherMap provides reliable basic weather data with 5-day forecast',
        features: ['5-day forecast', 'Reliable data', 'Global coverage']
      },
      'fallback': {
        primary: 'weatherAPI',
        fallback: 'openWeatherMap',
        reason: 'Use WeatherAPI as primary for rich data, OpenWeatherMap as reliable backup',
        features: ['Best of both worlds', 'High reliability', 'Rich data when available']
      }
    };

    return recommendations[useCase] || recommendations.fallback;
  }

  // Generate comparison report
  generateComparisonReport(location, comparisonData) {
    const report = {
      location,
      generatedAt: new Date().toISOString(),
      summary: {
        weatherAPISuccess: comparisonData.weatherAPI?.success || false,
        openWeatherSuccess: comparisonData.openWeatherMap?.success || false,
        bothWorking: (comparisonData.weatherAPI?.success && comparisonData.openWeatherMap?.success) || false
      },
      dataQuality: {
        weatherAPI: {
          score: this.calculateDataQualityScore('weatherAPI'),
          strengths: this.comparison.weatherAPI.uniqueFeatures,
          weaknesses: this.comparison.weatherAPI.limitations
        },
        openWeatherMap: {
          score: this.calculateDataQualityScore('openWeatherMap'),
          strengths: this.comparison.openWeatherMap.uniqueFeatures,
          weaknesses: this.comparison.openWeatherMap.limitations
        }
      },
      recommendation: this.getRecommendation('fallback')
    };

    return report;
  }

  // Calculate data quality score (0-100)
  calculateDataQualityScore(api) {
    const features = this.comparison[api].features;
    let score = 0;
    let totalFeatures = 0;

    Object.values(features).forEach(category => {
      Object.values(category).forEach(feature => {
        totalFeatures++;
        if (feature.includes('✅')) score += 1;
        else if (feature.includes('⚠️')) score += 0.5;
      });
    });

    return Math.round((score / totalFeatures) * 100);
  }
}

const weatherAPIComparison = new WeatherAPIComparison();
export default weatherAPIComparison;


