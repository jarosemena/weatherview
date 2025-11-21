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
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', {
      favoriteCities: ['London'],
      temperatureUnit: 'celsius'
    });
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
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', {
      favoriteCities: ['London', 'Tokyo'],
      temperatureUnit: 'celsius'
    });
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
    expect(storageService.set).toHaveBeenCalledWith('userPreferences', {
      favoriteCities: [],
      temperatureUnit: 'fahrenheit'
    });
  });

  it('should persist preferences to storage on every change', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => usePreferencesContext(), {
      wrapper: createWrapper()
    });

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
});
