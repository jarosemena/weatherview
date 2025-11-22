import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './Dashboard';
import { WeatherProvider } from '../../context/WeatherContext';
import { PreferencesProvider } from '../../context/PreferencesContext';
import { theme } from '../../theme/theme';
import { geolocationService } from '../../services/geolocationService';
import { weatherApi } from '../../services/weatherApi';
import type { WeatherData } from '../../types/weather.types';

vi.mock('../../services/geolocationService');
vi.mock('../../services/weatherApi');

const mockWeatherData: WeatherData = {
  city: 'London',
  country: 'GB',
  coordinates: { lat: 51.5074, lon: -0.1278 },
  temperature: { current: 20, feelsLike: 19, min: 18, max: 22 },
  conditions: { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
  humidity: 65,
  pressure: 1013,
  wind: { speed: 5.5, direction: 180 },
  visibility: 10000,
  timestamp: 1637000000
};

function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <ThemeProvider theme={theme}>
          <WeatherProvider>
            {component}
          </WeatherProvider>
        </ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dashboard container', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
  });

  it('should request geolocation on mount', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue({
      lat: 51.5074,
      lon: -0.1278
    });
    vi.mocked(weatherApi.getCurrentWeatherByCoords).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(geolocationService.getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('should fetch weather data when geolocation succeeds', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue({
      lat: 51.5074,
      lon: -0.1278
    });
    vi.mocked(weatherApi.getCurrentWeatherByCoords).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(weatherApi.getCurrentWeatherByCoords).toHaveBeenCalledWith(51.5074, -0.1278);
    });
  });

  it('should display loading state while fetching location', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ lat: 51.5074, lon: -0.1278 }), 100))
    );

    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display default city when geolocation fails', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockRejectedValue(
      new Error('Permission denied')
    );
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith('London');
    });
  });

  it('should display error message when geolocation times out', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockRejectedValue(
      new Error('Timeout')
    );
    vi.mocked(weatherApi.getCurrentWeather).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/using default location/i)).toBeInTheDocument();
    });
  });

  it('should display weather data when loaded', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue({
      lat: 51.5074,
      lon: -0.1278
    });
    vi.mocked(weatherApi.getCurrentWeatherByCoords).mockResolvedValue(mockWeatherData);
    vi.mocked(weatherApi.getForecast).mockResolvedValue([]);

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('London, GB')).toBeInTheDocument();
    });
  });

  it('should render header section', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render main content section', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should display app title', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/weather data visualizer/i)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    vi.mocked(geolocationService.getCurrentPosition).mockResolvedValue({
      lat: 51.5074,
      lon: -0.1278
    });
    vi.mocked(weatherApi.getCurrentWeatherByCoords).mockRejectedValue(
      new Error('Network error')
    );

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
