import { usePreferencesContext } from '../context/PreferencesContext';
import type { TemperatureUnit, Theme } from '../types/preferences.types';

export interface UseUserPreferencesReturn {
  favoriteCities: string[];
  temperatureUnit: TemperatureUnit;
  theme: Theme;
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  toggleTheme: () => void;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const context = usePreferencesContext();

  return {
    favoriteCities: context.favoriteCities,
    temperatureUnit: context.temperatureUnit,
    theme: context.theme,
    addFavorite: context.addFavorite,
    removeFavorite: context.removeFavorite,
    setTemperatureUnit: context.setTemperatureUnit,
    toggleTheme: context.toggleTheme
  };
}
