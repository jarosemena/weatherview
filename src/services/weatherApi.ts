import axios from 'axios';
import type { WeatherData, ForecastData, City } from '../types/weather.types';

// Open-Meteo API - Completely free, no API key required
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

interface GeoResponse {
  results?: Array<{
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryRequest<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      await sleep(RETRY_DELAY);
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
}

function isRetryableError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      (error.response?.status ?? 0) >= 500
    );
  }
  return false;
}

// Weather code to description mapping (WMO Weather interpretation codes)
function getWeatherDescription(code: number): { main: string; description: string; icon: string } {
  const weatherCodes: Record<number, { main: string; description: string; icon: string }> = {
    0: { main: 'Clear', description: 'clear sky', icon: '01d' },
    1: { main: 'Clear', description: 'mainly clear', icon: '01d' },
    2: { main: 'Clouds', description: 'partly cloudy', icon: '02d' },
    3: { main: 'Clouds', description: 'overcast', icon: '03d' },
    45: { main: 'Fog', description: 'foggy', icon: '50d' },
    48: { main: 'Fog', description: 'depositing rime fog', icon: '50d' },
    51: { main: 'Drizzle', description: 'light drizzle', icon: '09d' },
    53: { main: 'Drizzle', description: 'moderate drizzle', icon: '09d' },
    55: { main: 'Drizzle', description: 'dense drizzle', icon: '09d' },
    61: { main: 'Rain', description: 'slight rain', icon: '10d' },
    63: { main: 'Rain', description: 'moderate rain', icon: '10d' },
    65: { main: 'Rain', description: 'heavy rain', icon: '10d' },
    71: { main: 'Snow', description: 'slight snow', icon: '13d' },
    73: { main: 'Snow', description: 'moderate snow', icon: '13d' },
    75: { main: 'Snow', description: 'heavy snow', icon: '13d' },
    77: { main: 'Snow', description: 'snow grains', icon: '13d' },
    80: { main: 'Rain', description: 'slight rain showers', icon: '09d' },
    81: { main: 'Rain', description: 'moderate rain showers', icon: '09d' },
    82: { main: 'Rain', description: 'violent rain showers', icon: '09d' },
    85: { main: 'Snow', description: 'slight snow showers', icon: '13d' },
    86: { main: 'Snow', description: 'heavy snow showers', icon: '13d' },
    95: { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '11d' },
    99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '11d' }
  };
  
  return weatherCodes[code] || { main: 'Unknown', description: 'unknown', icon: '01d' };
}

function transformWeatherData(data: OpenMeteoWeatherResponse, cityName: string, country: string): WeatherData {
  const weatherInfo = getWeatherDescription(data.current.weather_code);
  
  return {
    city: cityName,
    country: country,
    coordinates: {
      lat: data.latitude,
      lon: data.longitude
    },
    temperature: {
      current: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      min: data.daily.temperature_2m_min[0],
      max: data.daily.temperature_2m_max[0]
    },
    conditions: weatherInfo,
    humidity: data.current.relative_humidity_2m,
    pressure: data.current.pressure_msl,
    wind: {
      speed: data.current.wind_speed_10m,
      direction: data.current.wind_direction_10m
    },
    visibility: 10000, // Open-Meteo doesn't provide visibility
    timestamp: Date.now() / 1000
  };
}

function transformForecastData(data: OpenMeteoWeatherResponse): ForecastData[] {
  const forecastDays = data.daily.time.length;
  
  return Array.from({ length: Math.min(forecastDays, 5) }, (_, i) => {
    const weatherInfo = getWeatherDescription(data.daily.weather_code[i]);
    
    return {
      date: data.daily.time[i],
      temperature: {
        min: data.daily.temperature_2m_min[i],
        max: data.daily.temperature_2m_max[i],
        average: (data.daily.temperature_2m_min[i] + data.daily.temperature_2m_max[i]) / 2
      },
      conditions: weatherInfo,
      precipitation: data.daily.precipitation_sum[i],
      humidity: 0, // Open-Meteo doesn't provide daily humidity in free tier
      wind: {
        speed: data.daily.wind_speed_10m_max[i],
        direction: data.daily.wind_direction_10m_dominant[i]
      }
    };
  });
}

function transformCityData(data: GeoResponse): City[] {
  if (!data.results || data.results.length === 0) {
    return [];
  }
  
  return data.results.map(item => ({
    name: item.name,
    country: item.country,
    state: item.admin1,
    coordinates: {
      lat: item.latitude,
      lon: item.longitude
    }
  }));
}

async function getCurrentWeather(city: string): Promise<WeatherData> {
  try {
    // First, get coordinates for the city
    const geoResponse = await axios.get<GeoResponse>(`${GEO_URL}/search`, {
      params: {
        name: city,
        count: 3, // Get top 3 results to have fallback options
        language: 'en',
        format: 'json'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.warn(`City "${city}" not found, using default city`);
      // Fallback to a default city
      return await getCurrentWeather('London');
    }

    const cityData = geoResponse.data.results[0];
    
    // Then get weather data
    const weatherResponse = await retryRequest(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      })
    );

    return transformWeatherData(weatherResponse.data, cityData.name, cityData.country);
  } catch (error) {
    console.error(`Error fetching weather for "${city}":`, error);
    
    // If this is already a fallback to London, throw the error
    if (city.toLowerCase() === 'london') {
      throw new Error('Failed to fetch weather data');
    }
    
    // Otherwise, try London as fallback
    console.log('Trying fallback city: London');
    try {
      return await getCurrentWeather('London');
    } catch (fallbackError) {
      throw new Error('Failed to fetch weather data');
    }
  }
}

async function getCurrentWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    // First, try to get weather data for exact coordinates
    const weatherResponse = await retryRequest(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      })
    );

    // Try to get city name from reverse geocoding
    let cityName = 'Current Location';
    let country = '';
    let countryName = '';
    
    try {
      // Use Nominatim for reverse geocoding (free, no API key)
      const reverseGeoResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'WeatherDataVisualizer/1.0'
        }
      });

      if (reverseGeoResponse.data && reverseGeoResponse.data.address) {
        const address = reverseGeoResponse.data.address;
        cityName = address.city || address.town || address.village || address.county || address.state || 'Current Location';
        country = address.country_code?.toUpperCase() || '';
        countryName = address.country || '';
      }
    } catch (geoError) {
      console.warn('Reverse geocoding failed, using default location name');
    }

    return transformWeatherData(weatherResponse.data, cityName, country);
  } catch (error) {
    console.error('Error fetching weather by exact coordinates, trying fallback...', error);
    
    // Fallback: Try to get nearest city or country capital
    try {
      // Get reverse geocoding to find country
      const reverseGeoResponse = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon,
          format: 'json',
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'WeatherDataVisualizer/1.0'
        }
      });

      if (reverseGeoResponse.data && reverseGeoResponse.data.address) {
        const address = reverseGeoResponse.data.address;
        const countryName = address.country || '';
        const stateName = address.state || '';
        
        // Try to find a nearby city or use capital
        let fallbackCity = address.city || address.town || address.state || countryName;
        
        if (fallbackCity) {
          console.log(`Using fallback location: ${fallbackCity}`);
          return await getCurrentWeather(fallbackCity);
        }
      }
      
      // Last resort: use a default city
      console.log('Using default fallback: London');
      return await getCurrentWeather('London');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      throw new Error('Failed to fetch weather data by coordinates');
    }
  }
}

async function getForecast(city: string, days: number): Promise<ForecastData[]> {
  try {
    // First, get coordinates for the city
    const geoResponse = await axios.get<GeoResponse>(`${GEO_URL}/search`, {
      params: {
        name: city,
        count: 3, // Get top 3 results for fallback
        language: 'en',
        format: 'json'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      console.warn(`City "${city}" not found for forecast, using default`);
      // Return empty forecast instead of failing
      return [];
    }

    const cityData = geoResponse.data.results[0];
    
    // Get forecast data (Open-Meteo provides 7 days by default in free tier)
    const weatherResponse = await retryRequest(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      })
    );

    return transformForecastData(weatherResponse.data);
  } catch (error) {
    console.error(`Error fetching forecast for "${city}":`, error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

async function searchCities(query: string): Promise<City[]> {
  try {
    const response = await axios.get<GeoResponse>(`${GEO_URL}/search`, {
      params: {
        name: query,
        count: 5,
        language: 'en',
        format: 'json'
      }
    });

    return transformCityData(response.data);
  } catch (error) {
    return [];
  }
}

export const weatherApi = {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  getForecast,
  searchCities
};
