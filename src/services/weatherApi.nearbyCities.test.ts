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
          // Generate valid latitude (-90 to 90), excluding NaN and Infinity
          fc.double({ min: -90, max: 90, noNaN: true }).filter(n => isFinite(n)),
          // Generate valid longitude (-180 to 180), excluding NaN and Infinity
          fc.double({ min: -180, max: 180, noNaN: true }).filter(n => isFinite(n)),
          async (lat, lon) => {
            // getNearbyCities uses hardcoded list, no need to mock axios
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
              expect(isFinite(city.distance)).toBe(true);
            });
          }
        ),
        { numRuns: 20 }
      );
    },
    15000
  );

  /**
   * Feature: weather-data-visualizer, Property 6: Nearby cities filtered and sorted by distance
   * Validates: Requirements 12.4
   */
  it(
    'Property 6: nearby cities should be filtered by radius and sorted by distance',
    async () => {
      const fc = await import('fast-check');

      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: -90, max: 90, noNaN: true }).filter(n => isFinite(n)),
          fc.double({ min: -180, max: 180, noNaN: true }).filter(n => isFinite(n)),
          fc.integer({ min: 50, max: 20000 }), // Reasonable radius range in km
          async (lat, lon, radius) => {
            // getNearbyCities uses hardcoded list, no need to mock
            const result = await weatherApi.getNearbyCities(lat, lon, radius);

            // Property 1: All cities should be within the specified radius
            result.forEach((city) => {
              expect(city.distance).toBeLessThanOrEqual(radius);
            });

            // Property 2: Cities should be sorted by distance (ascending)
            for (let i = 1; i < result.length; i++) {
              expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance);
            }

            // Property 3: No city should have distance = 0 (exact location excluded)
            result.forEach((city) => {
              expect(city.distance).toBeGreaterThan(0);
            });

            vi.clearAllMocks();
          }
        ),
        { numRuns: 30 }
      );
    },
    20000
  );
});
