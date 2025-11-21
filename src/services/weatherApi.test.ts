import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import { weatherApi } from './weatherApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('weatherApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather for a city', async () => {
      const mockResponse = {
        data: {
          name: 'London',
          sys: { country: 'GB' },
          coord: { lat: 51.5074, lon: -0.1278 },
          main: {
            temp: 20,
            feels_like: 19,
            temp_min: 18,
            temp_max: 22,
            humidity: 65,
            pressure: 1013
          },
          weather: [{
            main: 'Clouds',
            description: 'scattered clouds',
            icon: '03d'
          }],
          wind: {
            speed: 5.5,
            deg: 180
          },
          visibility: 10000,
          dt: 1637000000
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherApi.getCurrentWeather('London');

      expect(result).toEqual({
        city: 'London',
        country: 'GB',
        coordinates: { lat: 51.5074, lon: -0.1278 },
        temperature: {
          current: 20,
          feelsLike: 19,
          min: 18,
          max: 22
        },
        conditions: {
          main: 'Clouds',
          description: 'scattered clouds',
          icon: '03d'
        },
        humidity: 65,
        pressure: 1013,
        wind: {
          speed: 5.5,
          direction: 180
        },
        visibility: 10000,
        timestamp: 1637000000
      });
    });

    it('should throw error when city is not found', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 }
      });

      await expect(weatherApi.getCurrentWeather('InvalidCity'))
        .rejects.toThrow('City not found');
    });

    it('should retry on network error', async () => {
      mockedAxios.get
        .mockRejectedValueOnce({ code: 'ECONNABORTED' })
        .mockResolvedValueOnce({
          data: {
            name: 'Paris',
            sys: { country: 'FR' },
            coord: { lat: 48.8566, lon: 2.3522 },
            main: { temp: 15, feels_like: 14, temp_min: 13, temp_max: 17, humidity: 70, pressure: 1010 },
            weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
            wind: { speed: 3.5, deg: 90 },
            visibility: 8000,
            dt: 1637000000
          }
        });

      const result = await weatherApi.getCurrentWeather('Paris');
      expect(result.city).toBe('Paris');
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('getCurrentWeatherByCoords', () => {
    it('should fetch current weather by coordinates', async () => {
      const mockResponse = {
        data: {
          name: 'Tokyo',
          sys: { country: 'JP' },
          coord: { lat: 35.6762, lon: 139.6503 },
          main: { temp: 25, feels_like: 24, temp_min: 23, temp_max: 27, humidity: 60, pressure: 1015 },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          wind: { speed: 2.5, deg: 45 },
          visibility: 10000,
          dt: 1637000000
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherApi.getCurrentWeatherByCoords(35.6762, 139.6503);

      expect(result.city).toBe('Tokyo');
      expect(result.coordinates).toEqual({ lat: 35.6762, lon: 139.6503 });
    });
  });

  describe('getForecast', () => {
    it('should fetch 5-day forecast for a city', async () => {
      const mockResponse = {
        data: {
          list: [
            {
              dt_txt: '2023-11-15 12:00:00',
              main: { temp_min: 10, temp_max: 15, temp: 12.5, humidity: 70 },
              weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
              pop: 0.5,
              wind: { speed: 4.5, deg: 180 }
            },
            {
              dt_txt: '2023-11-16 12:00:00',
              main: { temp_min: 12, temp_max: 17, temp: 14.5, humidity: 65 },
              weather: [{ main: 'Clouds', description: 'few clouds', icon: '02d' }],
              pop: 0.2,
              wind: { speed: 3.5, deg: 90 }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherApi.getForecast('London', 5);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2023-11-15',
        temperature: {
          min: 10,
          max: 15,
          average: 12.5
        },
        conditions: {
          main: 'Rain',
          description: 'light rain',
          icon: '10d'
        },
        precipitation: 50,
        humidity: 70,
        wind: {
          speed: 4.5,
          direction: 180
        }
      });
    });
  });

  describe('searchCities', () => {
    it('should search cities by query', async () => {
      const mockResponse = {
        data: [
          {
            name: 'London',
            country: 'GB',
            state: 'England',
            lat: 51.5074,
            lon: -0.1278
          },
          {
            name: 'London',
            country: 'CA',
            state: 'Ontario',
            lat: 42.9834,
            lon: -81.2497
          }
        ]
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherApi.searchCities('London');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'London',
        country: 'GB',
        state: 'England',
        coordinates: { lat: 51.5074, lon: -0.1278 }
      });
    });

    it('should return empty array when no cities found', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await weatherApi.searchCities('XYZ123');

      expect(result).toEqual([]);
    });
  });
});
