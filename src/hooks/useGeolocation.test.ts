import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';
import { geolocationService } from '../services/geolocationService';

vi.mock('../services/geolocationService');

describe('useGeolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.coordinates).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should request location and return coordinates', async () => {
    const mockCoords = { lat: 51.5074, lon: -0.1278 };
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue(mockCoords);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.coordinates).toEqual(mockCoords);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should set loading state while requesting location', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ lat: 51.5074, lon: -0.1278 }), 100))
    );

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle permission denied error', async () => {
    const error = new Error('Permission denied');
    vi.mocked(geolocationService.getCurrentPosition).mockRejectedValue(error);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Permission denied');
      expect(result.current.coordinates).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle timeout error', async () => {
    const error = new Error('Timeout');
    vi.mocked(geolocationService.getCurrentPosition).mockRejectedValue(error);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Timeout');
      expect(result.current.coordinates).toBeNull();
    });
  });

  it('should handle position unavailable error', async () => {
    const error = new Error('Position unavailable');
    vi.mocked(geolocationService.getCurrentPosition).mockRejectedValue(error);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toBe('Position unavailable');
    });
  });

  it('should allow multiple location requests', async () => {
    const mockCoords1 = { lat: 51.5074, lon: -0.1278 };
    const mockCoords2 = { lat: 48.8566, lon: 2.3522 };

    vi.mocked(geolocationService.getCurrentPosition)
      .mockResolvedValueOnce(mockCoords1)
      .mockResolvedValueOnce(mockCoords2);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.coordinates).toEqual(mockCoords1);
    });

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.coordinates).toEqual(mockCoords2);
    });
  });

  it('should clear error on successful request after previous error', async () => {
    const error = new Error('Permission denied');
    vi.mocked(geolocationService.getCurrentPosition)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ lat: 51.5074, lon: -0.1278 });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.coordinates).toEqual({ lat: 51.5074, lon: -0.1278 });
    });
  });

  it('should pass options to geolocation service', async () => {
    const mockCoords = { lat: 51.5074, lon: -0.1278 };
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue(mockCoords);

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation({ timeout: 3000 });
    });

    await waitFor(() => {
      expect(result.current.coordinates).toEqual(mockCoords);
    });

    expect(geolocationService.getCurrentPosition).toHaveBeenCalledWith({ timeout: 3000 });
  });
});
