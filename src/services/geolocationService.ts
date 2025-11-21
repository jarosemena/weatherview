import type { Coordinates } from '../types/weather.types';

const DEFAULT_TIMEOUT = 5000;

interface GeolocationOptions {
  timeout?: number;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
}

function getCurrentPosition(options?: GeolocationOptions): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    const timeout = options?.timeout ?? DEFAULT_TIMEOUT;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permission denied'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Position unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Timeout'));
            break;
          default:
            reject(new Error('Unknown error'));
        }
      },
      {
        timeout,
        enableHighAccuracy: options?.enableHighAccuracy ?? false,
        maximumAge: options?.maximumAge ?? 0
      }
    );
  });
}

function watchPosition(callback: (coords: Coordinates) => void): number {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
    },
    (error) => {
      console.error('Geolocation watch error:', error);
    }
  );
}

function clearWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

export const geolocationService = {
  getCurrentPosition,
  watchPosition,
  clearWatch
};
