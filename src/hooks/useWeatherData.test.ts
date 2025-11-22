import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeatherData } from './useWeatherData';
import { WeatherProvider } from '../context/WeatherContext';
import { weatherApi } from '../services/weatherApi';
import type { WeatherData, ForecastData } from '../types/weather.types';
import React from 'react';

vi.mock('../services/weatherApi');

const mockWeatherData: WeatherData = {
  city: 'London',
  country: 'GB',
  coordinates: { lat: 51.5074, lon: -0.1278 },
  temperature: { current: 20, feelsLike: 19, min: 18, max: 22 },
  conditions: { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
  humidity: 65,
  pressure: 1013,
  wind: { speed: 5.5, direction: 180 },
  visibility: 10000,
  timestamp: 1637000000
};

const mockForecastData: ForecastData[] = [
  {
    date: '2023-11-15',
    temperature: { min: 10, max: 15, average: 12.5 },
    conditions: { main: 'Rain', description: 'light rain', icon: '10d' },
    precipitation: 50,
    humidity: 70,
    wind: { speed: 4.5, direction: 180 }
  }
];

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(WeatherProvider, null, children)
  );
};

describe('useWeatherData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useWeatherData(), { wrapper });

    expect(result.current.currentWeather).toBeNull();
    expect(result.current.forecast).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch weather by city', async () => {
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue(mockForecastData);

    const { result } = renderHook(() => useWeatherData(), { wrapper });

    await result.current.fetchWeatherByCity('London');

    await waitFor(() => {
      expect(result.current.currentWeather).toEqual(mockWeatherData);
      expect(result.current.forecast).toEqual(mockForecastData);
      expect(result.current.isLoading).toBe(false);
    });

    expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('London');
  });

  it('should fetch weather by coordinates', async () => {
    vi.mocked(weatherApi.getCurrentWeatherByCoords).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue(mockForecastData);

    const { result } = renderHook(() => useWeatherData(), { wrapper });

    await result.current.fetchWeatherByCoords(51.5074, -0.1278);

    await waitFor(() => {
      expect(result.current.currentWeather).toEqual(mockWeatherData);
      expect(result.current.forecast).toEqual(mockForecastData);
    });

    expect(weatherApi.getCurrentWeatherByCoords).toHaveBeenCalledWith(51.5074, -0.1278);
  });

  it('should handle loading state', async () => {
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue(mockForecastData);

    const { result } = renderHook(() => useWeatherData(), { wrapper });

    await result.current.fetchWeatherByCity('London');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentWeather).toEqual(mockWeatherData);
    });
  });

  it('should handle errors', async () => {
    const error = new Error('City not found');
    vi.mocked(weatherApi.getCurrentWeather).mockRejectedValue(error);

    const { result } = renderHook(() => useWeatherData(), { wrapper });

    await result.current.fetchWeatherByCity('InvalidCity');

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.currentWeather).toBeNull();
    });
  });

  it('should refetch weather data', async () => {
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue(mockForecastData);

    const { result } = renderHook(() => useWeatherData(), { wrapper });

    await result.current.fetchWeatherByCity('London');

    await waitFor(() => {
      expect(result.current.currentWeather).toEqual(mockWeatherData);
    });

    const updatedWeatherData = {
      ...mockWeatherData,
      temperature: { ...mockWeatherData.temperature, current: 25 }
    };
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(updatedWeatherData);

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.currentWeather?.temperature.current).toBe(25);
    });
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useWeatherData(), { wrapper });

    expect(typeof result.current.fetchWeatherByCity).toBe('function');
    expect(typeof result.current.fetchWeatherByCoords).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });
});
