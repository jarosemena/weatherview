import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { ChartView } from './ChartView';
import { theme } from '../../theme/theme';
import type { ForecastData } from '../../types/weather.types';

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: any) => (
    <div data-testid="line-chart" data-chart-type="line">
      {data.labels.join(',')}
    </div>
  ),
  Bar: ({ data, options }: any) => (
    <div data-testid="bar-chart" data-chart-type="bar">
      {data.labels.join(',')}
    </div>
  )
}));

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn()
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn()
}));

const mockForecastData: ForecastData[] = [
  {
    date: '2023-11-15',
    temperature: { min: 10, max: 15, average: 12.5 },
    conditions: { main: 'Rain', description: 'light rain', icon: '10d' },
    precipitation: 50,
    humidity: 70,
    wind: { speed: 4.5, direction: 180 }
  },
  {
    date: '2023-11-16',
    temperature: { min: 12, max: 17, average: 14.5 },
    conditions: { main: 'Clouds', description: 'few clouds', icon: '02d' },
    precipitation: 20,
    humidity: 65,
    wind: { speed: 3.5, direction: 90 }
  }
];

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('ChartView', () => {
  it('should render temperature chart by default', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render precipitation chart as bar chart', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="precipitation"
        timeRange="7d"
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render wind chart', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="wind"
        timeRange="7d"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should display chart title', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
      />
    );

    expect(screen.getByText(/temperature/i)).toBeInTheDocument();
  });

  it('should show time range in title', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="24h"
      />
    );

    expect(screen.getByText(/24h/i)).toBeInTheDocument();
  });

  it('should render legend when multiple cities provided', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
        cities={['London', 'Paris']}
      />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should not render legend when single city', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
        cities={['London']}
      />
    );

    // Legend should not be visible for single city
    const legend = screen.queryByRole('list', { name: /legend/i });
    expect(legend).not.toBeInTheDocument();
  });

  it('should display dates in chart', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
      />
    );

    const chart = screen.getByTestId('line-chart');
    expect(chart.textContent).toContain('2023-11-15');
    expect(chart.textContent).toContain('2023-11-16');
  });

  it('should handle empty data gracefully', () => {
    renderWithTheme(
      <ChartView
        data={[]}
        type="temperature"
        timeRange="7d"
      />
    );

    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('should show correct units for temperature', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="temperature"
        timeRange="7d"
      />
    );

    expect(screen.getByText(/°C/i)).toBeInTheDocument();
  });

  it('should show correct units for precipitation', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="precipitation"
        timeRange="7d"
      />
    );

    expect(screen.getByText(/%/i)).toBeInTheDocument();
  });

  it('should show correct units for wind', () => {
    renderWithTheme(
      <ChartView
        data={mockForecastData}
        type="wind"
        timeRange="7d"
      />
    );

    expect(screen.getByText(/m\/s/i)).toBeInTheDocument();
  });
});
