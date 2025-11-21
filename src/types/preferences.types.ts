export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Theme = 'light' | 'dark';

export interface UserPreferences {
  favoriteCities: string[];
  temperatureUnit: TemperatureUnit;
  defaultCity?: string;
  theme?: Theme;
}
