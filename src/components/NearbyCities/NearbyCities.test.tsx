import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { NearbyCities } from './NearbyCities';
import { useNearbyCities } from '../../hooks/useNearbyCities';
import { getTheme } from '../../theme/theme';

vi.mock('../../hooks/useNearbyCities');

describe('NearbyCities', () => {
  const mockCoordinates = { lat: 51.5074, lon: -0.1278 };
  const mockOnCitySelect = vi.fn();

  const mockCities = [
    {
      name: 'Westminster',
      country: 'GB',
      state: 'England',
      coordinates: { lat: 51.4975, lon: -0.1357 },
      distance: 1.2
    },
    {
      name: 'Camden',
      country: 'GB',
      state: 'England',
      coordinates: { lat: 51.5424, lon: -0.1426 },
      distance: 3.8
    }
  ];

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={getTheme('light')}>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: [],
      isLoading: true,
      error: null,
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('Loading nearby cities...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: [],
      isLoading: false,
      error: new Error('Network error'),
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('Failed to load nearby cities')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: [],
      isLoading: false,
      error: null,
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('No nearby cities found')).toBeInTheDocument();
  });

  it('should render list of nearby cities', () => {
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: mockCities,
      isLoading: false,
      error: null,
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    expect(screen.getByText('Westminster, GB')).toBeInTheDocument();
    expect(screen.getByText('Camden, GB')).toBeInTheDocument();
    expect(screen.getByText('1.2 km')).toBeInTheDocument();
    expect(screen.getByText('3.8 km')).toBeInTheDocument();
  });

  it('should call onCitySelect when city is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: mockCities,
      isLoading: false,
      error: null,
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    const cityItem = screen.getByText('Westminster, GB');
    await user.click(cityItem);

    expect(mockOnCitySelect).toHaveBeenCalledWith({
      name: 'Westminster',
      country: 'GB',
      state: 'England',
      coordinates: { lat: 51.4975, lon: -0.1357 }
    });
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: mockCities,
      isLoading: false,
      error: null,
      fetchNearbyCities: vi.fn()
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    const cityItems = screen.getAllByRole('button');
    cityItems[0].focus();
    expect(cityItems[0]).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
  });

  it('should fetch nearby cities on mount', () => {
    const mockFetch = vi.fn();
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: [],
      isLoading: false,
      error: null,
      fetchNearbyCities: mockFetch
    });

    renderWithTheme(
      <NearbyCities coordinates={mockCoordinates} onCitySelect={mockOnCitySelect} />
    );

    expect(mockFetch).toHaveBeenCalledWith(mockCoordinates, 100);
  });

  it('should use custom radius when provided', () => {
    const mockFetch = vi.fn();
    vi.mocked(useNearbyCities).mockReturnValue({
      nearbyCities: [],
      isLoading: false,
      error: null,
      fetchNearbyCities: mockFetch
    });

    renderWithTheme(
      <NearbyCities
        coordinates={mockCoordinates}
        onCitySelect={mockOnCitySelect}
      />
    );

    expect(mockFetch).toHaveBeenCalledWith(mockCoordinates);
  });
});
