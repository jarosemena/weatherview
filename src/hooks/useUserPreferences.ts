import { usePreferencesContext } from '../context/PreferencesContext';
import type { TemperatureUnit } from '../types/preferences.types';

export interface UseUserPreferencesReturn {
  favoriteCities: string[];
  temperatureUnit: TemperatureUnit;
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

export function useUserPreferences(): UseUserPreferencesReturn {
  const context = usePreferencesContext();

  return {
    favoriteCities: context.favoriteCities,
    temperatureUnit: context.temperatureUnit,
    addFavorite: context.addFavorite,
    removeFavorite: context.removeFavorite,
    setTemperatureUnit: context.setTemperatureUnit
  };
}
