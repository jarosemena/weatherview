export interface WeatherData {
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  temperature: {
    current: number;
    feelsLike: number;
    min: number;
    max: number;
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    direction: number;
  };
  visibility: number;
  timestamp: number;
}

export interface ForecastData {
  date: string;
  temperature: {
    min: number;
    max: number;
    average: number;
  };
  conditions: {
    main: string;
    description: string;
    icon: string;
  };
  precipitation: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
}

export interface City {
  name: string;
  country: string;
  state?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    city: string;
  }[];
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  GEOLOCATION_ERROR: 'GEOLOCATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  details?: unknown;
  timestamp: number;
}

export type GeolocationError = AppError & {
  type: typeof ErrorType.GEOLOCATION_ERROR;
};

export type TimeRange = '1d' | '3d' | '5d';
export type ChartType = 'temperature' | 'precipitation' | 'wind';
