// Weather API Configuration
// You can also set these in .env.local file
const weatherConfig = {
  weatherAPI: {
    key: process.env.REACT_APP_WEATHERAPI_KEY || '9a326527834a4813a8d222049253009',
    baseUrl: 'https://api.weatherapi.com/v1'
  },
  openWeatherMap: {
    key: process.env.REACT_APP_OPENWEATHER_API_KEY || '4b4403c19907765a9064694fe536f0e9',
    baseUrl: 'https://api.openweathermap.org/data/2.5'
  }
};

export default weatherConfig;


