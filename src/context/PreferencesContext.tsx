import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storageService } from '../services/storageService';
import type { UserPreferences, TemperatureUnit, Theme, FavoriteCity } from '../types/preferences.types';

interface PreferencesContextValue {
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

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = 'userPreferences';

const defaultPreferences: UserPreferences = {
  favoriteCities: [],
  favoriteCitiesV2: [],
  temperatureUnit: 'celsius',
  theme: 'light'
};

interface PreferencesProviderProps {
  children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = storageService.get<UserPreferences>(STORAGE_KEY);
    return saved || defaultPreferences;
  });

  // Persist preferences to storage whenever they change
  useEffect(() => {
    storageService.set(STORAGE_KEY, preferences);
  }, [preferences]);

  const addFavorite = useCallback((city: string, coordinates?: { lat: number; lon: number }) => {
    setPreferences(prev => {
      // Check if already exists in V2
      const existsInV2 = prev.favoriteCitiesV2?.some(fav => fav.name === city);
      if (existsInV2) {
        return prev;
      }

      // Also maintain legacy format for backward compatibility
      const favoriteCities = prev.favoriteCities.includes(city) 
        ? prev.favoriteCities 
        : [...prev.favoriteCities, city];

      // Add to V2 format with coordinates
      const favoriteCitiesV2 = [
        ...(prev.favoriteCitiesV2 || []),
        { name: city, coordinates }
      ];

      return {
        ...prev,
        favoriteCities,
        favoriteCitiesV2
      };
    });
  }, []);

  const removeFavorite = useCallback((city: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCities: prev.favoriteCities.filter(c => c !== city),
      favoriteCitiesV2: (prev.favoriteCitiesV2 || []).filter(fav => fav.name !== city)
    }));
  }, []);

  const setTemperatureUnit = useCallback((unit: TemperatureUnit) => {
    setPreferences(prev => ({
      ...prev,
      temperatureUnit: unit
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  }, []);

  const getFavoriteCoordinates = useCallback((city: string) => {
    const favorite = preferences.favoriteCitiesV2?.find(fav => fav.name === city);
    return favorite?.coordinates;
  }, [preferences.favoriteCitiesV2]);

  const value: PreferencesContextValue = {
    favoriteCities: preferences.favoriteCities,
    favoriteCitiesV2: preferences.favoriteCitiesV2 || [],
    temperatureUnit: preferences.temperatureUnit,
    theme: preferences.theme || 'light',
    addFavorite,
    removeFavorite,
    setTemperatureUnit,
    toggleTheme,
    getFavoriteCoordinates
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferencesContext(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferencesContext must be used within PreferencesProvider');
  }
  return context;
}
