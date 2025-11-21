import { useState, useCallback } from 'react';
import { geolocationService } from '../services/geolocationService';
import type { Coordinates, GeolocationError } from '../types/weather.types';

export interface UseGeolocationReturn {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: GeolocationError | null;
  requestLocation: (options?: { timeout?: number; enableHighAccuracy?: boolean }) => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  const requestLocation = useCallback((options?: { timeout?: number; enableHighAccuracy?: boolean }) => {
    setIsLoading(true);
    setError(null);

    geolocationService
      .getCurrentPosition(options)
      .then((coords) => {
        setCoordinates(coords);
        setError(null);
      })
      .catch((err) => {
        setError(err as GeolocationError);
        setCoordinates(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return {
    coordinates,
    isLoading,
    error,
    requestLocation
  };
}
