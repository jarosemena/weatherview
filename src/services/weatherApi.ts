import axios from 'axios';
import type { WeatherData, ForecastData, City } from '../types/weather.types';
import { retryWithBackoff } from '../utils/retryWithBackoff';

// Open-Meteo API - Completely free, no API key required
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1';

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
    
    // Then get weather data with exponential backoff
    const weatherResponse = await retryWithBackoff(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt) => {
          console.log(`Retrying weather request (attempt ${attempt})...`);
        }
      }
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
  lon: number,
  preferredCityName?: string
): Promise<WeatherData> {
  try {
    // First, try to get weather data for exact coordinates with exponential backoff
    const weatherResponse = await retryWithBackoff(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt) => {
          console.log(`Retrying weather request by coords (attempt ${attempt})...`);
        }
      }
    );

    // Use preferred city name if provided, otherwise try reverse geocoding
    let cityName = preferredCityName || 'Current Location';
    let country = '';
    let countryName = '';
    
    // Only do reverse geocoding if no preferred name was provided
    if (!preferredCityName) {
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
          // Prioritize actual city names over regions/states
          // Only use county/state as last resort
          cityName = address.city || address.town || address.village || address.municipality || 
                     address.county || address.state_district || address.state || 'Current Location';
          country = address.country_code?.toUpperCase() || '';
          countryName = address.country || '';
          
          // Log for debugging
          console.log('Reverse geocoding result:', { cityName, country, fullAddress: address });
        }
      } catch (geoError) {
        console.warn('Reverse geocoding failed, using default location name');
      }
    } else {
      console.log(`Using preferred city name: ${preferredCityName}`);
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
    
    // Get forecast data (Open-Meteo provides 7 days by default in free tier) with exponential backoff
    const weatherResponse = await retryWithBackoff(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt) => {
          console.log(`Retrying forecast request (attempt ${attempt})...`);
        }
      }
    );

    return transformForecastData(weatherResponse.data);
  } catch (error) {
    console.error(`Error fetching forecast for "${city}":`, error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
}

async function getForecastByCoords(lat: number, lon: number): Promise<ForecastData[]> {
  try {
    // Get forecast data directly using coordinates
    const weatherResponse = await retryWithBackoff(() =>
      axios.get<OpenMeteoWeatherResponse>(`${WEATHER_BASE_URL}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant',
          timezone: 'auto'
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (attempt) => {
          console.log(`Retrying forecast request by coords (attempt ${attempt})...`);
        }
      }
    );

    return transformForecastData(weatherResponse.data);
  } catch (error) {
    console.error(`Error fetching forecast for coordinates (${lat}, ${lon}):`, error);
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

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getNearbyCities(
  lat: number,
  lon: number,
  radius: number = 100
): Promise<Array<City & { distance: number }>> {
  try {
    // Use a hardcoded list of major cities and calculate distances
    // This is a workaround since the geocoding API doesn't support radius search
    const majorCities = [
      { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB' },
      { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR' },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'DE' },
      { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'ES' },
      { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'IT' },
      { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'NL' },
      { name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'BE' },
      { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'AT' },
      { name: 'Prague', lat: 50.0755, lon: 14.4378, country: 'CZ' },
      { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, country: 'DK' },
      { name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'SE' },
      { name: 'Oslo', lat: 59.9139, lon: 10.7522, country: 'NO' },
      { name: 'Helsinki', lat: 60.1699, lon: 24.9384, country: 'FI' },
      { name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'PL' },
      { name: 'Budapest', lat: 47.4979, lon: 19.0402, country: 'HU' },
      { name: 'Lisbon', lat: 38.7223, lon: -9.1393, country: 'PT' },
      { name: 'Dublin', lat: 53.3498, lon: -6.2603, country: 'IE' },
      { name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'GR' },
      { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US' },
      { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'US' },
      { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'US' },
      { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'US' },
      { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'US' },
      { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'US' },
      { name: 'San Antonio', lat: 29.4241, lon: -98.4936, country: 'US' },
      { name: 'San Diego', lat: 32.7157, lon: -117.1611, country: 'US' },
      { name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'US' },
      { name: 'San Jose', lat: 37.3382, lon: -121.8863, country: 'US' },
      { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'CA' },
      { name: 'Montreal', lat: 45.5017, lon: -73.5673, country: 'CA' },
      { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'CA' },
      { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'MX' },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP' },
      { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'KR' },
      { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'CN' },
      { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'CN' },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN' },
      { name: 'Delhi', lat: 28.7041, lon: 77.1025, country: 'IN' },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU' },
      { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'AU' },
      { name: 'Brisbane', lat: -27.4698, lon: 153.0251, country: 'AU' },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, country: 'BR' },
      { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'BR' },
      { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'AR' },
      { name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'CL' },
      { name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'PE' },
      { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'CO' },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'EG' },
      { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'NG' },
      { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'ZA' },
      { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SG' },
      { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'TH' },
      { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'PH' },
      { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'ID' },
      { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'TR' },
      { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'RU' },
      { name: 'Saint Petersburg', lat: 59.9311, lon: 30.3609, country: 'RU' }
    ];

    // Calculate distances for all cities
    const citiesWithDistance = majorCities
      .map((city) => {
        const distance = calculateDistance(lat, lon, city.lat, city.lon);
        return {
          name: city.name,
          country: city.country,
          state: undefined,
          coordinates: {
            lat: city.lat,
            lon: city.lon
          },
          distance
        };
      })
      .filter((city) => city.distance > 0 && city.distance <= radius) // Filter by radius and exclude exact location
      .sort((a, b) => a.distance - b.distance) // Sort by distance ascending
      .slice(0, 10); // Get the 10 nearest cities within radius

    console.log('Nearby cities found:', citiesWithDistance.length, 'for location:', lat, lon);
    console.log('Nearest city:', citiesWithDistance[0]?.name, citiesWithDistance[0]?.distance, 'km');

    return citiesWithDistance;
  } catch (error) {
    console.error('Error fetching nearby cities:', error);
    throw new Error('Failed to fetch nearby cities');
  }
}

export const weatherApi = {
  getCurrentWeather,
  getCurrentWeatherByCoords,
  getForecast,
  getForecastByCoords,
  searchCities,
  getNearbyCities
};
