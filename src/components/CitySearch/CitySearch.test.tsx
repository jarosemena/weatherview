import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { CitySearch } from './CitySearch';
import { theme } from '../../theme/theme';
import { weatherApi } from '../../services/weatherApi';
import type { City } from '../../types/weather.types';

vi.mock('../../services/weatherApi');

const mockCities: City[] = [
  {
    name: 'London',
    country: 'GB',
    state: 'England',
    coordinates: { lat: 51.5074, lon: -0.1278 }
  },
  {
    name: 'London',
    country: 'CA',
    state: 'Ontario',
    coordinates: { lat: 42.9834, lon: -81.2497 }
  }
];

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('CitySearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    renderWithTheme(
      <CitySearch onCitySelect={vi.fn()} placeholder="Find a city" />
    );

    const input = screen.getByPlaceholderText('Find a city');
    expect(input).toBeInTheDocument();
  });

  it('should show suggestions when typing 3+ characters', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText('London, England, GB')).toBeInTheDocument();
      expect(screen.getByText('London, Ontario, CA')).toBeInTheDocument();
    });
  });

  it('should not search with less than 3 characters', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lo');

    await waitFor(() => {
      expect(weatherApi.searchCities).not.toHaveBeenCalled();
    });
  });

  it('should debounce search requests', async () => {
    const user = userEvent.setup({ delay: null });
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    
    // Type quickly
    await user.type(input, 'London');

    // Should only call once after debounce
    await waitFor(() => {
      expect(weatherApi.searchCities).toHaveBeenCalledTimes(1);
    }, { timeout: 500 });
  });

  it('should call onCitySelect when suggestion is clicked', async () => {
    const user = userEvent.setup();
    const onCitySelect = vi.fn();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={onCitySelect} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText('London, England, GB')).toBeInTheDocument();
    });

    await user.click(screen.getByText('London, England, GB'));

    expect(onCitySelect).toHaveBeenCalledWith(mockCities[0]);
  });

  it('should clear input after selecting a city', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...') as HTMLInputElement;
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText('London, England, GB')).toBeInTheDocument();
    });

    await user.click(screen.getByText('London, England, GB'));

    expect(input.value).toBe('');
  });

  it('should close suggestions after selecting a city', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText('London, England, GB')).toBeInTheDocument();
    });

    await user.click(screen.getByText('London, England, GB'));

    expect(screen.queryByText('London, England, GB')).not.toBeInTheDocument();
  });

  it('should show loading state while searching', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockCities), 100))
    );

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  it('should show "no results" message when no cities found', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue([]);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'XYZ');

    await waitFor(() => {
      expect(screen.getByText(/no cities found/i)).toBeInTheDocument();
    });
  });

  it('should handle search errors gracefully', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockRejectedValue(new Error('API Error'));

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText(/error searching/i)).toBeInTheDocument();
    });
  });

  it('should clear suggestions when input is cleared', async () => {
    const user = userEvent.setup();
    vi.mocked(weatherApi.searchCities).mockResolvedValue(mockCities);

    renderWithTheme(<CitySearch onCitySelect={vi.fn()} />);

    const input = screen.getByPlaceholderText('Search city...');
    await user.type(input, 'Lon');

    await waitFor(() => {
      expect(screen.getByText('London, England, GB')).toBeInTheDocument();
    });

    await user.clear(input);

    expect(screen.queryByText('London, England, GB')).not.toBeInTheDocument();
  });
});
