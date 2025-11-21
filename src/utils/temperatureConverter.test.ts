import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit, fahrenheitToCelsius, convertTemperature } from './temperatureConverter';

describe('temperatureConverter', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert 0°C to 32°F', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
    });

    it('should convert 100°C to 212°F', () => {
      expect(celsiusToFahrenheit(100)).toBe(212);
    });

    it('should convert -40°C to -40°F', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40);
    });

    it('should convert 20°C to 68°F', () => {
      expect(celsiusToFahrenheit(20)).toBe(68);
    });

    it('should handle decimal values', () => {
      expect(celsiusToFahrenheit(25.5)).toBeCloseTo(77.9, 1);
    });

    it('should handle negative temperatures', () => {
      expect(celsiusToFahrenheit(-10)).toBe(14);
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('should convert 32°F to 0°C', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
    });

    it('should convert 212°F to 100°C', () => {
      expect(fahrenheitToCelsius(212)).toBe(100);
    });

    it('should convert -40°F to -40°C', () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40);
    });

    it('should convert 68°F to 20°C', () => {
      expect(fahrenheitToCelsius(68)).toBe(20);
    });

    it('should handle decimal values', () => {
      expect(fahrenheitToCelsius(77.9)).toBeCloseTo(25.5, 1);
    });

    it('should handle negative temperatures', () => {
      expect(fahrenheitToCelsius(14)).toBe(-10);
    });
  });

  describe('convertTemperature', () => {
    it('should convert from celsius to fahrenheit', () => {
      expect(convertTemperature(0, 'celsius', 'fahrenheit')).toBe(32);
      expect(convertTemperature(100, 'celsius', 'fahrenheit')).toBe(212);
    });

    it('should convert from fahrenheit to celsius', () => {
      expect(convertTemperature(32, 'fahrenheit', 'celsius')).toBe(0);
      expect(convertTemperature(212, 'fahrenheit', 'celsius')).toBe(100);
    });

    it('should return same value when units are the same', () => {
      expect(convertTemperature(25, 'celsius', 'celsius')).toBe(25);
      expect(convertTemperature(77, 'fahrenheit', 'fahrenheit')).toBe(77);
    });

    it('should round to 1 decimal place', () => {
      expect(convertTemperature(25.555, 'celsius', 'fahrenheit')).toBeCloseTo(78, 0);
    });
  });

  describe('round trip conversions', () => {
    it('should maintain value after round trip conversion', () => {
      const original = 25;
      const toFahrenheit = celsiusToFahrenheit(original);
      const backToCelsius = fahrenheitToCelsius(toFahrenheit);
      
      expect(backToCelsius).toBeCloseTo(original, 1);
    });

    it('should maintain value after reverse round trip', () => {
      const original = 77;
      const toCelsius = fahrenheitToCelsius(original);
      const backToFahrenheit = celsiusToFahrenheit(toCelsius);
      
      expect(backToFahrenheit).toBeCloseTo(original, 1);
    });
  });
});
