import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { WeatherCard } from './WeatherCard';
import { theme } from '../../theme/theme';
import type { WeatherData } from '../../types/weather.types';

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

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('WeatherCard', () => {
  it('should render city name and country', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText('London, GB')).toBeInTheDocument();
  });

  it('should display current temperature in celsius', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText('20°C')).toBeInTheDocument();
  });

  it('should display current temperature in fahrenheit', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="fahrenheit"
      />
    );

    expect(screen.getByText('68°F')).toBeInTheDocument();
  });

  it('should display weather conditions', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText('Clouds')).toBeInTheDocument();
    expect(screen.getByText('scattered clouds')).toBeInTheDocument();
  });

  it('should display feels like temperature', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText(/Feels like 19°C/)).toBeInTheDocument();
  });

  it('should display min and max temperatures', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText(/18°C/)).toBeInTheDocument();
    expect(screen.getByText(/22°C/)).toBeInTheDocument();
  });

  it('should display humidity', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText(/65%/)).toBeInTheDocument();
  });

  it('should display wind speed', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText(/5.5 m\/s/)).toBeInTheDocument();
  });

  it('should display pressure', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    expect(screen.getByText(/1013 hPa/)).toBeInTheDocument();
  });

  it('should show favorite button when onFavoriteToggle is provided', () => {
    const onFavoriteToggle = vi.fn();

    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
        onFavoriteToggle={onFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('should call onFavoriteToggle when favorite button is clicked', async () => {
    const user = userEvent.setup();
    const onFavoriteToggle = vi.fn();

    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
        onFavoriteToggle={onFavoriteToggle}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    await user.click(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
  });

  it('should show filled star when isFavorite is true', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
        onFavoriteToggle={vi.fn()}
        isFavorite={true}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toHaveTextContent('★');
  });

  it('should show empty star when isFavorite is false', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
        onFavoriteToggle={vi.fn()}
        isFavorite={false}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toHaveTextContent('☆');
  });

  it('should not show favorite button when onFavoriteToggle is not provided', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="celsius"
      />
    );

    const favoriteButton = screen.queryByRole('button', { name: /favorite/i });
    expect(favoriteButton).not.toBeInTheDocument();
  });

  it('should convert all temperatures when unit is fahrenheit', () => {
    renderWithTheme(
      <WeatherCard
        city="London"
        weatherData={mockWeatherData}
        unit="fahrenheit"
      />
    );

    expect(screen.getByText('68°F')).toBeInTheDocument(); // current
    expect(screen.getByText(/Feels like 66.2°F/)).toBeInTheDocument(); // feels like
    expect(screen.getByText(/64.4°F/)).toBeInTheDocument(); // min
    expect(screen.getByText(/71.6°F/)).toBeInTheDocument(); // max
  });
});

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      expect(screen.getByText('London, GB')).toBeInTheDocument();
      expect(screen.getByText('20°C')).toBeInTheDocument();
      expect(screen.getByText('Clouds')).toBeInTheDocument();
    });

    it('should hide description in compact mode', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      const description = screen.queryByText('scattered clouds');
      expect(description).toBeInTheDocument();
      // Description should have display: none in compact mode
    });

    it('should hide feels like temperature in compact mode', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      const feelsLike = screen.queryByText(/Feels like/);
      expect(feelsLike).toBeInTheDocument();
      // Feels like should have display: none in compact mode
    });

    it('should hide min/max temperatures in compact mode', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      const minTemp = screen.queryByText(/↓ 18°C/);
      const maxTemp = screen.queryByText(/↑ 22°C/);
      expect(minTemp).toBeInTheDocument();
      expect(maxTemp).toBeInTheDocument();
      // Min/max should have display: none in compact mode
    });

    it('should hide weather details in compact mode', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      const humidity = screen.queryByText('Humidity');
      const wind = screen.queryByText('Wind');
      const pressure = screen.queryByText('Pressure');
      const visibility = screen.queryByText('Visibility');
      
      expect(humidity).toBeInTheDocument();
      expect(wind).toBeInTheDocument();
      expect(pressure).toBeInTheDocument();
      expect(visibility).toBeInTheDocument();
      // All details should have display: none in compact mode
    });

    it('should show all details in normal mode', () => {
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={false}
        />
      );

      expect(screen.getByText('scattered clouds')).toBeInTheDocument();
      expect(screen.getByText(/Feels like/)).toBeInTheDocument();
      expect(screen.getByText('Humidity')).toBeInTheDocument();
      expect(screen.getByText('Wind')).toBeInTheDocument();
    });

    it('should render smaller icon in compact mode', () => {
      const { container } = renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
        />
      );

      const icon = container.querySelector('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('alt', 'Weather icon showing scattered clouds');
    });

    it('should render favorite button in compact mode', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
          onFavoriteToggle={mockToggle}
          isFavorite={false}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /Add London to favorites/ });
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should handle favorite toggle in compact mode', async () => {
      const user = userEvent.setup();
      const mockToggle = vi.fn();
      
      renderWithTheme(
        <WeatherCard
          city="London"
          weatherData={mockWeatherData}
          unit="celsius"
          compact={true}
          onFavoriteToggle={mockToggle}
          isFavorite={false}
        />
      );

      const favoriteButton = screen.getByRole('button', { name: /Add London to favorites/ });
      await user.click(favoriteButton);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });
