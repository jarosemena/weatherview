import { useWeatherContext } from '../context/WeatherContext';
import type { WeatherData, ForecastData } from '../types/weather.types';

export interface UseWeatherDataReturn {
  currentWeather: WeatherData | null;
  forecast: ForecastData[];
  isLoading: boolean;
  error: Error | null;
  errorMessage: string | null;
  isUsingCache: boolean;
  fetchWeatherByCity: (city: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  refetch: () => void;
}

export function useWeatherData(): UseWeatherDataReturn {
  const context = useWeatherContext();

  return {
    currentWeather: context.currentWeather,
    forecast: context.forecast,
    isLoading: context.isLoading,
    error: context.error,
    errorMessage: context.errorMessage,
    isUsingCache: context.isUsingCache,
    fetchWeatherByCity: context.fetchWeatherByCity,
    fetchWeatherByCoords: context.fetchWeatherByCoords,
    refetch: context.refetch
  };
}
