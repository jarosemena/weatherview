import axios, { AxiosError } from 'axios';
import type { WeatherData, ForecastData, City } from '../types/weather.types';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface OpenWeatherResponse {
  name: string;
  sys: { country: string };
  coord: { lat: number; lon: number };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  dt: number;
}

interface ForecastResponse {
  list: Array<{
    dt_txt: string;
    main: {
      temp_min: number;
      temp_max: number;
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    wind: {
      speed: number;
      deg: number;
    };
  }>;
}

interface GeoResponse {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
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

function transformWeatherData(data: OpenWeatherResponse): WeatherData {
  return {
    city: data.name,
    country: data.sys.country,
    coordinates: {
      lat: data.coord.lat,
      lon: data.coord.lon
    },
    temperature: {
      current: data.main.temp,
      feelsLike: data.main.feels_like,
      min: data.main.temp_min,
      max: data.main.temp_max
    },
    conditions: {
      main: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    },
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind: {
      speed: data.wind.speed,
      direction: data.wind.deg
    },
    visibility: data.visibility,
    timestamp: data.dt
  };
}

function transformForecastData(data: ForecastResponse): ForecastData[] {
  // Group by date and take one entry per day
  const dailyData = new Map<string, ForecastResponse['list'][0]>();
  
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData.has(date)) {
      dailyData.set(date, item);
    }
  });

  return Array.from(dailyData.values()).map(item => ({
    date: item.dt_txt.split(' ')[0],
    temperature: {
      min: item.main.temp_min,
      max: item.main.temp_max,
      average: item.main.temp
    },
    conditions: {
      main: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon
    },
    precipitation: item.pop * 100,
    humidity: item.main.humidity,
    wind: {
      speed: item.wind.speed,
      direction: item.wind.deg
    }
  }));
}

function transformCityData(data: GeoResponse[]): City[] {
  return data.map(item => ({
    name: item.name,
    country: item.country,
    state: item.state,
    coordinates: {
      lat: item.lat,
      lon: item.lon
    }
  }));
}

async function getCurrentWeather(city: string): Promise<WeatherData> {
  try {
    const response = await retryRequest(() =>
      axios.get<OpenWeatherResponse>(`${BASE_URL}/weather`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric'
        }
      })
    );

    return transformWeatherData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('City not found');
    }
    throw new Error('Failed to fetch weather data');
  }
}

async function getCurrentWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherData> {
  try {
    const response = await retryRequest(() =>
      axios.get<OpenWeatherResponse>(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric'
        }
      })
    );

    return transformWeatherData(response.data);
  } catch (error) {
    throw new Error('Failed to fetch weather data by coordinates');
  }
}

async function getForecast(city: string, days: number): Promise<ForecastData[]> {
  try {
    const response = await retryRequest(() =>
      axios.get<ForecastResponse>(`${BASE_URL}/forecast`, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          cnt: days * 8 // API returns 3-hour intervals, 8 per day
        }
      })
    );

    return transformForecastData(response.data);
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
}

async function searchCities(query: string): Promise<City[]> {
  try {
    const response = await axios.get<GeoResponse[]>(`${GEO_URL}/direct`, {
      params: {
        q: query,
        limit: 5,
        appid: API_KEY
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
