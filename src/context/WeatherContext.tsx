import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { weatherApi } from '../services/weatherApi';
import { getErrorMessage } from '../utils/retryWithBackoff';
import type { WeatherData, ForecastData } from '../types/weather.types';

interface WeatherContextValue {
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

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isUsingCache, setIsUsingCache] = useState(false);
  const queryClient = useQueryClient();

  // Query for current weather
  const {
    data: currentWeather = null,
    isLoading: isLoadingWeather,
    error: weatherError,
    refetch: refetchWeather,
    isError: isWeatherError,
    isFetching: isFetchingWeather
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
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: false, // We handle retries in the API layer
    // Use cached data on error
    placeholderData: (previousData) => previousData
  });

  // Query for forecast
  const {
    data: forecast = [],
    isLoading: isLoadingForecast,
    error: forecastError,
    refetch: refetchForecast,
    isError: isForecastError
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
    gcTime: 10 * 60 * 1000,
    retry: false,
    placeholderData: (previousData) => previousData
  });

  // Track if we're using cached data
  useEffect(() => {
    if (isWeatherError && currentWeather) {
      setIsUsingCache(true);
    } else if (!isFetchingWeather && !isWeatherError) {
      setIsUsingCache(false);
    }
  }, [isWeatherError, currentWeather, isFetchingWeather]);

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

  const error = (weatherError || forecastError) as Error | null;
  const errorMessage = error ? getErrorMessage(error) : null;

  const value: WeatherContextValue = {
    currentWeather,
    forecast,
    isLoading: isLoadingWeather || isLoadingForecast,
    error,
    errorMessage,
    isUsingCache,
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
