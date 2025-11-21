import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { weatherApi } from '../services/weatherApi';
import type { WeatherData, ForecastData } from '../types/weather.types';

interface WeatherContextValue {
  currentWeather: WeatherData | null;
  forecast: ForecastData[];
  isLoading: boolean;
  error: Error | null;
  fetchWeatherByCity: (city: string) => Promise<void>;
  fetchWeatherByCoords: (lat: number, lon: number) => Promise<void>;
  refetch: () => void;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const queryClient = useQueryClient();

  // Query for current weather
  const {
    data: currentWeather = null,
    isLoading: isLoadingWeather,
    error: weatherError,
    refetch: refetchWeather
  } = useQuery({
    queryKey: ['weather', currentCity, currentCoords],
    queryFn: async () => {
      if (currentCity) {
        return await weatherApi.getCurrentWeather(currentCity);
      }
      if (currentCoords) {
        return await weatherApi.getCurrentWeatherByCoords(currentCoords.lat, currentCoords.lon);
      }
      return null;
    },
    enabled: !!(currentCity || currentCoords),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes (formerly cacheTime)
  });

  // Query for forecast
  const {
    data: forecast = [],
    isLoading: isLoadingForecast,
    error: forecastError,
    refetch: refetchForecast
  } = useQuery({
    queryKey: ['forecast', currentWeather?.city],
    queryFn: async () => {
      if (currentWeather?.city) {
        return await weatherApi.getForecast(currentWeather.city, 5);
      }
      return [];
    },
    enabled: !!currentWeather?.city,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const fetchWeatherByCity = useCallback(async (city: string) => {
    setCurrentCity(city);
    setCurrentCoords(null);
  }, []);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setCurrentCoords({ lat, lon });
    setCurrentCity(null);
  }, []);

  const refetch = useCallback(() => {
    refetchWeather();
    refetchForecast();
  }, [refetchWeather, refetchForecast]);

  const value: WeatherContextValue = {
    currentWeather,
    forecast,
    isLoading: isLoadingWeather || isLoadingForecast,
    error: (weatherError || forecastError) as Error | null,
    fetchWeatherByCity,
    fetchWeatherByCoords,
    refetch
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeatherContext must be used within WeatherProvider');
  }
  return context;
}
