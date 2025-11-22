import { useQueries } from '@tanstack/react-query';
import { weatherApi } from '../services/weatherApi';
import type { WeatherData, ForecastData } from '../types/weather.types';

export interface CityWeatherData {
  city: string;
  weather: WeatherData | null;
  forecast: ForecastData[];
  isLoading: boolean;
  error: Error | null;
}

export function useMultipleCitiesWeather(cities: string[]): CityWeatherData[] {
  // Fetch weather for all cities
  const weatherQueries = useQueries({
    queries: cities.map(city => ({
      queryKey: ['weather', city],
      queryFn: () => weatherApi.getCurrentWeather(city),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!city
    }))
  });

  // Fetch forecast for all cities
  const forecastQueries = useQueries({
    queries: cities.map(city => ({
      queryKey: ['forecast', city],
      queryFn: () => weatherApi.getForecast(city, 5),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: !!city
    }))
  });

  return cities.map((city, index) => ({
    city,
    weather: weatherQueries[index].data || null,
    forecast: forecastQueries[index].data || [],
    isLoading: weatherQueries[index].isLoading || forecastQueries[index].isLoading,
    error: (weatherQueries[index].error || forecastQueries[index].error) as Error | null
  }));
}
