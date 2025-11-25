import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import fc from 'fast-check';
import { WeatherCard } from './WeatherCard';
import { getTheme } from '../../theme/theme';
import type { WeatherData } from '../../types/weather.types';

/**
 * Feature: weather-data-visualizer, Property 10: Compact cards contain essential information
 * Validates: Requirements 13.5
 */
describe('WeatherCard Compact Mode Property Tests', () => {
  it(
    'Property 10: compact cards should always contain essential information (city, temperature, conditions)',
    () => {
      fc.assert(
        fc.property(
          fc.record({
            city: fc.stringMatching(/^[A-Za-z][A-Za-z\s]{2,18}[A-Za-z]$/), // Valid city names
            country: fc.constantFrom('US', 'GB', 'FR', 'DE', 'CA', 'ES', 'IT'),
            temperature: fc.integer({ min: -40, max: 50 }),
            conditions: fc.constantFrom('Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm', 'Drizzle', 'Mist')
          }),
          (data) => {
            const mockWeatherData: WeatherData = {
              city: data.city,
              country: data.country,
              coordinates: { lat: 0, lon: 0 },
              temperature: {
                current: data.temperature,
                feelsLike: data.temperature - 2,
                min: data.temperature - 5,
                max: data.temperature + 5
              },
              conditions: {
                main: data.conditions,
                description: data.conditions.toLowerCase(),
                icon: '01d'
              },
              humidity: 65,
              pressure: 1013,
              wind: { speed: 5.5, direction: 180 },
              visibility: 10000,
              timestamp: Date.now()
            };

            const { container } = render(
              <ThemeProvider theme={getTheme('light')}>
                <WeatherCard
                  city={data.city}
                  weatherData={mockWeatherData}
                  unit="celsius"
                  compact={true}
                />
              </ThemeProvider>
            );

            // Property: Compact cards must always display essential information
            // Verify the card is rendered
            const card = container.querySelector('[role="article"]');
            expect(card).toBeInTheDocument();
            
            // Verify essential information is present in the card
            const cardText = card?.textContent || '';
            
            // 1. City name and country must be present
            expect(cardText).toContain(data.city);
            expect(cardText).toContain(data.country);

            // 2. Current temperature must be present
            expect(cardText).toContain(`${data.temperature}°C`);

            // 3. Weather conditions must be present
            expect(cardText).toContain(data.conditions);
          }
        ),
        { numRuns: 30 }
      );
    }
  );
});
