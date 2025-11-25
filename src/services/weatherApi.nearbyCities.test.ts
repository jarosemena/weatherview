import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weatherApi } from './weatherApi';

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
            const result = await weatherApi.getNearbyCities(lat, lon);

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
   * Feature: weather-data-visualizer, Property 6: Nearby cities sorted by distance
   * Validates: Requirements 12.4
   */
  it(
    'Property 6: nearby cities should be sorted by distance',
    async () => {
      const fc = await import('fast-check');

      await fc.assert(
        fc.asyncProperty(
          fc.double({ min: -90, max: 90, noNaN: true }).filter(n => isFinite(n)),
          fc.double({ min: -180, max: 180, noNaN: true }).filter(n => isFinite(n)),
          async (lat, lon) => {
            // getNearbyCities uses hardcoded list, no need to mock
            const result = await weatherApi.getNearbyCities(lat, lon);

            // Property 1: Should return up to 10 cities
            expect(result.length).toBeLessThanOrEqual(10);

            // Property 2: Cities should be sorted by distance (ascending)
            for (let i = 1; i < result.length; i++) {
              expect(result[i].distance).toBeGreaterThanOrEqual(result[i - 1].distance);
            }

            // Property 3: All distances should be valid numbers
            result.forEach((city) => {
              expect(city.distance).toBeGreaterThanOrEqual(0);
              expect(isFinite(city.distance)).toBe(true);
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
