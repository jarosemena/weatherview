import type { TemperatureUnit } from '../types/preferences.types';

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5 + 32) * 10) / 10;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5/9) * 10) / 10;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  if (from === to) {
    return value;
  }

  if (from === 'celsius' && to === 'fahrenheit') {
    return celsiusToFahrenheit(value);
  }

  if (from === 'fahrenheit' && to === 'celsius') {
    return fahrenheitToCelsius(value);
  }

  return value;
}
