import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { weatherApi } from './weatherApi';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('weatherApi - Nearby Cities Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: weather-data-visualizer, Property 4: Coordinates fetch nearby cities
   * Validates: Requirements 12.1
   */
  it(
    'Property 4: valid coordinates should always return a list of nearby cities',
    async () => {
      const fc = await import('fast-check');

      await fc.assert(
        fc.asyncProperty(
          // Generate valid latitude (-90 to 90)
          fc.double({ min: -90, max: 90 }),
          // Generate valid longitude (-180 to 180)
          fc.double({ min: -180, max: 180 }),
          async (lat, lon) => {
            // Mock response with some cities
            const mockResponse = {
              data: {
                results: [
                  {
                    name: 'City A',
                    country: 'US',
                    admin1: 'State',
                    latitude: lat + 0.1,
                    longitude: lon + 0.1
                  },
                  {
                    name: 'City B',
                    country: 'US',
                    admin1: 'State',
                    latitude: lat + 0.2,
                    longitude: lon + 0.2
                  }
                ]
              }
            };

            mockedAxios.get.mockResolvedValueOnce(mockResponse);

            const result = await weatherApi.getNearbyCities(lat, lon, 100);

            // Property: For any valid coordinates, we should get a list (possibly empty)
            expect(Array.isArray(result)).toBe(true);

            // Property: All returned cities should have required fields
            result.forEach((city) => {
              expect(city).toHaveProperty('name');
              expect(city).toHaveProperty('country');
              expect(city).toHaveProperty('coordinates');
              expect(city).toHaveProperty('distance');
              expect(typeof city.distance).toBe('number');
              expect(city.distance).toBeGreaterThanOrEqual(0);
            });

            vi.clearAllMocks();
          }
        ),
        { numRuns: 20 }
      );
    },
    15000
  );
});
