import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PreferencesProvider, usePreferencesContext } from './PreferencesContext';
import { storageService } from '../services/storageService';

vi.mock('../services/storageService');

function createWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <PreferencesProvider>{children}</PreferencesProvider>
  );
}

describe('PreferencesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide default preferences', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    expect(result.current.favoriteCities).toEqual([]);
    expect(result.current.temperatureUnit).toBe('celsius');
  });

  it('should load preferences from storage on mount', () => {
    const savedPreferences = {
      favoriteCities: ['London', 'Paris'],
      temperatureUnit: 'fahrenheit' as const
    };
    vi.mocked(storageService.get).mockReturnValue(savedPreferences);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Paris']);
    expect(result.current.temperatureUnit).toBe('fahrenheit');
  });

  it('should add favorite city', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.addFavorite('London');
    });

    expect(result.current.favoriteCities).toEqual(['London']);
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', expect.objectContaining({
      favoriteCities: ['London'],
      temperatureUnit: 'celsius',
      theme: 'light'
    }));
  });

  it('should not add duplicate favorite city', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.addFavorite('London');
    });

    expect(result.current.favoriteCities).toEqual(['London']);
  });

  it('should remove favorite city', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London', 'Paris', 'Tokyo'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.removeFavorite('Paris');
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Tokyo']);
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', expect.objectContaining({
      favoriteCities: ['London', 'Tokyo'],
      temperatureUnit: 'celsius'
    }));
  });

  it('should set temperature unit', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.setTemperatureUnit('fahrenheit');
    });

    expect(result.current.temperatureUnit).toBe('fahrenheit');
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', expect.objectContaining({
      favoriteCities: [],
      temperatureUnit: 'fahrenheit',
      theme: 'light'
    }));
  });

  it('should persist preferences to storage on every change', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    // Clear any initial calls
    vi.clearAllMocks();

    act(() => {
      result.current.addFavorite('London');
    });

    expect(storageService.set).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.addFavorite('Paris');
    });

    expect(storageService.set).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.setTemperatureUnit('fahrenheit');
    });

    expect(storageService.set).toHaveBeenCalledTimes(3);
  });

  it('should handle multiple favorite cities', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.addFavorite('London');
      result.current.addFavorite('Paris');
      result.current.addFavorite('Tokyo');
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Paris', 'Tokyo']);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => usePreferencesContext());
    }).toThrow('usePreferencesContext must be used within PreferencesProvider');
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: weather-data-visualizer, Property 3: Saved theme is applied on load
     * Validates: Requirements 11.4
     */
    it(
      'Property 3: Dashboard should apply saved theme preference on load',
      async () => {
        const fc = await import('fast-check');

        await fc.assert(
          fc.property(
            fc.constantFrom('light' as const, 'dark' as const),
            (savedTheme) => {
              // Simular que hay un tema guardado en localStorage
              vi.mocked(storageService.get).mockReturnValue({
                favoriteCities: [],
                temperatureUnit: 'celsius',
                theme: savedTheme
              });

              // Renderizar el contexto (simula cargar el Dashboard)
              const { result } = renderHook(() => usePreferencesContext(), {
                wrapper: createWrapper()
              });

              // Verificar que el tema cargado es el que estaba guardado
              expect(result.current.theme).toBe(savedTheme);

              // Limpiar
              vi.clearAllMocks();
            }
          ),
          { numRuns: 100 }
        );
      }
    );
  });
});
