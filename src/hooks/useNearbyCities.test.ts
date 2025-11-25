import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNearbyCities, clearCache } from './useNearbyCities';
import { weatherApi } from '../services/weatherApi';

vi.mock('../services/weatherApi');

describe('useNearbyCities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCache(); // Clear cache between tests
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useNearbyCities());

    expect(result.current.nearbyCities).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch nearby cities successfully', async () => {
    const mockCities = [
      {
        name: 'City A',
        country: 'US',
        state: 'State',
        coordinates: { lat: 51.5, lon: -0.1 },
        distance: 5
      },
      {
        name: 'City B',
        country: 'US',
        state: 'State',
        coordinates: { lat: 51.6, lon: -0.2 },
        distance: 10
      }
    ];

    vi.mocked(weatherApi.getNearbyCities).mockResolvedValueOnce(mockCities);

    const { result } = renderHook(() => useNearbyCities());

    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nearbyCities).toEqual(mockCities);
    expect(result.current.error).toBeNull();
    expect(weatherApi.getNearbyCities).toHaveBeenCalledWith(51.5074, -0.1278);
  });

  it('should set loading to false after fetch completes', async () => {
    const mockCities = [
      {
        name: 'City A',
        country: 'US',
        state: 'State',
        coordinates: { lat: 51.5, lon: -0.1 },
        distance: 5
      }
    ];

    vi.mocked(weatherApi.getNearbyCities).mockResolvedValueOnce(mockCities);

    const { result } = renderHook(() => useNearbyCities());

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(weatherApi.getNearbyCities).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useNearbyCities());

    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('Network error');
    expect(result.current.nearbyCities).toEqual([]);
  });

  it('should use cached data for same location within cache duration', async () => {
    const mockCities = [
      {
        name: 'City A',
        country: 'US',
        state: 'State',
        coordinates: { lat: 51.5, lon: -0.1 },
        distance: 5
      }
    ];

    vi.mocked(weatherApi.getNearbyCities).mockResolvedValue(mockCities);

    const { result } = renderHook(() => useNearbyCities());

    // First call
    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(weatherApi.getNearbyCities).toHaveBeenCalledTimes(1);

    // Second call with same location (should use cache)
    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    // Should still be called only once (cache hit)
    expect(weatherApi.getNearbyCities).toHaveBeenCalledTimes(1);
    expect(result.current.nearbyCities).toEqual(mockCities);
  });

  it('should fetch new data for different location', async () => {
    const mockCities1 = [
      {
        name: 'City A',
        country: 'US',
        state: 'State',
        coordinates: { lat: 51.5, lon: -0.1 },
        distance: 5
      }
    ];

    const mockCities2 = [
      {
        name: 'City B',
        country: 'FR',
        state: 'Region',
        coordinates: { lat: 48.8, lon: 2.3 },
        distance: 3
      }
    ];

    vi.mocked(weatherApi.getNearbyCities)
      .mockResolvedValueOnce(mockCities1)
      .mockResolvedValueOnce(mockCities2);

    const { result } = renderHook(() => useNearbyCities());

    // First location
    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 51.5074, lon: -0.1278 });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.nearbyCities).toEqual(mockCities1);

    // Different location (should fetch new data)
    await act(async () => {
      await result.current.fetchNearbyCities({ lat: 48.8566, lon: 2.3522 });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(weatherApi.getNearbyCities).toHaveBeenCalledTimes(2);
    expect(result.current.nearbyCities).toEqual(mockCities2);
  });
});
