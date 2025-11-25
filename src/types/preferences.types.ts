export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type Theme = 'light' | 'dark';

export interface FavoriteCity {
  name: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

export interface UserPreferences {
  favoriteCities: string[]; // Legacy format for backward compatibility
  favoriteCitiesV2?: FavoriteCity[]; // New format with coordinates
  temperatureUnit: TemperatureUnit;
  defaultCity?: string;
  theme?: Theme;
}
