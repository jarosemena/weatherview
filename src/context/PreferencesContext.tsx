import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { storageService } from '../services/storageService';
import type { UserPreferences, TemperatureUnit } from '../types/preferences.types';

interface PreferencesContextValue {
  favoriteCities: string[];
  temperatureUnit: TemperatureUnit;
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = 'userPreferences';

const defaultPreferences: UserPreferences = {
  favoriteCities: [],
  temperatureUnit: 'celsius'
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

  const addFavorite = useCallback((city: string) => {
    setPreferences(prev => {
      if (prev.favoriteCities.includes(city)) {
        return prev;
      }
      return {
        ...prev,
        favoriteCities: [...prev.favoriteCities, city]
      };
    });
  }, []);

  const removeFavorite = useCallback((city: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCities: prev.favoriteCities.filter(c => c !== city)
    }));
  }, []);

  const setTemperatureUnit = useCallback((unit: TemperatureUnit) => {
    setPreferences(prev => ({
      ...prev,
      temperatureUnit: unit
    }));
  }, []);

  const value: PreferencesContextValue = {
    favoriteCities: preferences.favoriteCities,
    temperatureUnit: preferences.temperatureUnit,
    addFavorite,
    removeFavorite,
    setTemperatureUnit
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
