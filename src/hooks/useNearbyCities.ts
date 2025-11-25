import { useState, useCallback } from 'react';
import { weatherApi } from '../services/weatherApi';
import type { City } from '../types/weather.types';

export interface UseNearbyCitiesReturn {
  nearbyCities: Array<City & { distance: number }>;
  isLoading: boolean;
  error: Error | null;
  fetchNearbyCities: (coords: { lat: number; lon: number }) => Promise<void>;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface CacheEntry {
  data: Array<City & { distance: number }>;
  timestamp: number;
  coords: { lat: number; lon: number };
  radius: number;
}

let cache: CacheEntry | null = null;

// Export for testing purposes
export function clearCache() {
  cache = null;
}

export function useNearbyCities(): UseNearbyCitiesReturn {
  const [nearbyCities, setNearbyCities] = useState<Array<City & { distance: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchNearbyCities = useCallback(
    async (coords: { lat: number; lon: number }) => {
      // Check cache
      if (cache) {
        const now = Date.now();
        const isCacheValid = now - cache.timestamp < CACHE_DURATION;
        const isSameLocation =
          Math.abs(cache.coords.lat - coords.lat) < 0.01 &&
          Math.abs(cache.coords.lon - coords.lon) < 0.01;

        if (isCacheValid && isSameLocation) {
          setNearbyCities(cache.data);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const cities = await weatherApi.getNearbyCities(coords.lat, coords.lon);
        setNearbyCities(cities);

        // Update cache
        cache = {
          data: cities,
          timestamp: Date.now(),
          coords,
          radius: 0 // Not used anymore but kept for cache structure
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch nearby cities');
        setError(error);
        setNearbyCities([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    nearbyCities,
    isLoading,
    error,
    fetchNearbyCities
  };
}
