import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUserPreferences } from './useUserPreferences';
import { PreferencesProvider } from '../context/PreferencesContext';
import { storageService } from '../services/storageService';
import React from 'react';

vi.mock('../services/storageService');

const wrapper = ({ children }: { children: React.ReactNode }) => React.createElement(PreferencesProvider, null, children);

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should return default preferences', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    expect(result.current.favoriteCities).toEqual([]);
    expect(result.current.temperatureUnit).toBe('celsius');
  });

  it('should load saved preferences', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London', 'Paris'],
      temperatureUnit: 'fahrenheit'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    expect(result.current.favoriteCities).toEqual(['London', 'Paris']);
    expect(result.current.temperatureUnit).toBe('fahrenheit');
  });

  it('should add favorite city', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.addFavorite('London');
    });

    expect(result.current.favoriteCities).toEqual(['London']);
  });

  it('should not add duplicate favorite', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.addFavorite('London');
    });

    expect(result.current.favoriteCities).toEqual(['London']);
  });

  it('should add multiple favorites', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.addFavorite('London');
      result.current.addFavorite('Paris');
      result.current.addFavorite('Tokyo');
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Paris', 'Tokyo']);
  });

  it('should remove favorite city', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London', 'Paris', 'Tokyo'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.removeFavorite('Paris');
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Tokyo']);
  });

  it('should not error when removing non-existent favorite', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.removeFavorite('Paris');
    });

    expect(result.current.favoriteCities).toEqual(['London']);
  });

  it('should set temperature unit to fahrenheit', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.setTemperatureUnit('fahrenheit');
    });

    expect(result.current.temperatureUnit).toBe('fahrenheit');
  });

  it('should set temperature unit to celsius', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: [],
      temperatureUnit: 'fahrenheit'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.setTemperatureUnit('celsius');
    });

    expect(result.current.temperatureUnit).toBe('celsius');
  });

  it('should persist changes to storage', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.addFavorite('London');
    });

    expect(storageService.set).toHaveBeenCalled();
  });

  it('should maintain favorites when changing temperature unit', () => {
    vi.mocked(storageService.get).mockReturnValue({
      favoriteCities: ['London', 'Paris'],
      temperatureUnit: 'celsius'
    });

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    act(() => {
      result.current.setTemperatureUnit('fahrenheit');
    });

    expect(result.current.favoriteCities).toEqual(['London', 'Paris']);
    expect(result.current.temperatureUnit).toBe('fahrenheit');
  });

  it('should provide all required methods', () => {
    vi.mocked(storageService.get).mockReturnValue(null);

    const { result } = renderHook(() => useUserPreferences(), { wrapper });

    expect(typeof result.current.addFavorite).toBe('function');
    expect(typeof result.current.removeFavorite).toBe('function');
    expect(typeof result.current.setTemperatureUnit).toBe('function');
  });
});
