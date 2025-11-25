import { usePreferencesContext } from '../context/PreferencesContext';
import type { TemperatureUnit, Theme, FavoriteCity } from '../types/preferences.types';

export interface UseUserPreferencesReturn {
  favoriteCities: string[];
  favoriteCitiesV2: FavoriteCity[];
  temperatureUnit: TemperatureUnit;
  theme: Theme;
  addFavorite: (city: string, coordinates?: { lat: number; lon: number }) => void;
  removeFavorite: (city: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  toggleTheme: () => void;
  getFavoriteCoordinates: (city: string) => { lat: number; lon: number } | undefined;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const context = usePreferencesContext();

  return {
    favoriteCities: context.favoriteCities,
    favoriteCitiesV2: context.favoriteCitiesV2,
    temperatureUnit: context.temperatureUnit,
    theme: context.theme,
    addFavorite: context.addFavorite,
    removeFavorite: context.removeFavorite,
    setTemperatureUnit: context.setTemperatureUnit,
    toggleTheme: context.toggleTheme,
    getFavoriteCoordinates: context.getFavoriteCoordinates
  };
}
