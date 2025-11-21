import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { CityComparison } from './CityComparison';
import { theme } from '../../theme/theme';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('CityComparison', () => {
  it('should render all cities', () => {
    const cities = ['London', 'Paris', 'Tokyo'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
  });

  it('should render remove button for each city', () => {
    const cities = ['London', 'Paris'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(2);
  });

  it('should call onRemoveCity when remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemoveCity = vi.fn();
    const cities = ['London', 'Paris'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={onRemoveCity} />
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(onRemoveCity).toHaveBeenCalledWith('London');
  });

  it('should display cities in a grid layout', () => {
    const cities = ['London', 'Paris', 'Tokyo'];
    
    const { container } = renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} />
    );

    const grid = container.querySelector('[data-testid="comparison-grid"]');
    expect(grid).toBeInTheDocument();
  });

  it('should show add city button when below max cities', () => {
    const cities = ['London', 'Paris'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} maxCities={4} />
    );

    expect(screen.getByText(/add city/i)).toBeInTheDocument();
  });

  it('should not show add city button when at max cities', () => {
    const cities = ['London', 'Paris', 'Tokyo', 'New York'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} maxCities={4} />
    );

    expect(screen.queryByText(/add city/i)).not.toBeInTheDocument();
  });

  it('should use default maxCities of 4', () => {
    const cities = ['London', 'Paris', 'Tokyo', 'New York'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} />
    );

    expect(screen.queryByText(/add city/i)).not.toBeInTheDocument();
  });

  it('should handle empty cities array', () => {
    renderWithTheme(
      <CityComparison cities={[]} onRemoveCity={vi.fn()} />
    );

    expect(screen.getByText(/no cities/i)).toBeInTheDocument();
  });

  it('should handle single city', () => {
    renderWithTheme(
      <CityComparison cities={['London']} onRemoveCity={vi.fn()} />
    );

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('should display comparison title', () => {
    renderWithTheme(
      <CityComparison cities={['London', 'Paris']} onRemoveCity={vi.fn()} />
    );

    expect(screen.getByText(/city comparison/i)).toBeInTheDocument();
  });

  it('should show city count', () => {
    const cities = ['London', 'Paris', 'Tokyo'];
    
    renderWithTheme(
      <CityComparison cities={cities} onRemoveCity={vi.fn()} maxCities={4} />
    );

    expect(screen.getByText(/3 of 4 cities/i)).toBeInTheDocument();
  });
});
