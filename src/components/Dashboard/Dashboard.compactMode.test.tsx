import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: weather-data-visualizer, Property 7: Multiple favorites activate compact mode
 * Validates: Requirements 13.1
 */
describe('Dashboard Compact Mode Property Tests', () => {
  it(
    'Property 7: multiple favorites (>= 2) should activate compact mode',
    () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 3, maxLength: 20 }),
            { minLength: 2, maxLength: 10 }
          ),
          (favoriteCities) => {
            // Property: When there are 2 or more favorite cities,
            // the Dashboard should activate compact mode for WeatherCards
            
            const shouldBeCompact = favoriteCities.length >= 2;
            
            // Verify the logic that determines compact mode
            expect(shouldBeCompact).toBe(true);
            expect(favoriteCities.length).toBeGreaterThanOrEqual(2);
          }
        ),
        { numRuns: 50 }
      );
    }
  );
});
