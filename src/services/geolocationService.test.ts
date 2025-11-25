import { describe, it, expect, beforeEach, vi } from 'vitest';
import { geolocationService } from './geolocationService';

describe('geolocationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentPosition', () => {
    it('should return coordinates when geolocation is successful', async () => {
      const mockPosition = {
        coords: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success(mockPosition);
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      const result = await geolocationService.getCurrentPosition();

      expect(result).toEqual({
        lat: 51.5074,
        lon: -0.1278
      });
    });

    it('should reject with error when permission is denied', async () => {
      const mockError = {
        code: 1,
        message: 'User denied geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => {
          error(mockError);
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(geolocationService.getCurrentPosition())
        .rejects.toThrow('Permission denied');
    });

    it('should reject with error when position is unavailable', async () => {
      const mockError = {
        code: 2,
        message: 'Position unavailable',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => {
          error(mockError);
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(geolocationService.getCurrentPosition())
        .rejects.toThrow('Position unavailable');
    });

    it('should reject with timeout error after 5 seconds', async () => {
      const mockError = {
        code: 3,
        message: 'Timeout',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((_success, error) => {
          // Simulate timeout by calling error callback
          setTimeout(() => error(mockError), 50);
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      await expect(geolocationService.getCurrentPosition({ timeout: 100 }))
        .rejects.toThrow('Timeout');
    }, 10000); // Increase test timeout

    it('should use custom timeout option', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const mockGeolocation = {
        getCurrentPosition: vi.fn((success, _error, options) => {
          expect(options?.timeout).toBe(3000);
          success(mockPosition);
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      const result = await geolocationService.getCurrentPosition({ timeout: 3000 });

      expect(result).toEqual({
        lat: 40.7128,
        lon: -74.0060
      });
    });

    it('should throw error when geolocation is not supported', async () => {
      vi.stubGlobal('navigator', {});

      await expect(geolocationService.getCurrentPosition())
        .rejects.toThrow('Geolocation is not supported');
    });
  });

  describe('watchPosition', () => {
    it('should watch position and call callback with coordinates', () => {
      const mockPosition = {
        coords: {
          latitude: 35.6762,
          longitude: 139.6503
        }
      };

      const mockGeolocation = {
        watchPosition: vi.fn((success) => {
          success(mockPosition);
          return 123;
        })
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      const callback = vi.fn();
      const watchId = geolocationService.watchPosition(callback);

      expect(watchId).toBe(123);
      expect(callback).toHaveBeenCalledWith({
        lat: 35.6762,
        lon: 139.6503
      });
    });

    it('should throw error when geolocation is not supported', () => {
      vi.stubGlobal('navigator', {});

      expect(() => geolocationService.watchPosition(vi.fn()))
        .toThrow('Geolocation is not supported');
    });
  });

  describe('clearWatch', () => {
    it('should clear watch position', () => {
      const mockGeolocation = {
        clearWatch: vi.fn()
      };

      vi.stubGlobal('navigator', { geolocation: mockGeolocation });

      geolocationService.clearWatch(123);

      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
    });

    it('should not throw when geolocation is not supported', () => {
      vi.stubGlobal('navigator', {});

      expect(() => geolocationService.clearWatch(123)).not.toThrow();
    });
  });
});
