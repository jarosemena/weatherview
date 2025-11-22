import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { SkeletonScreen, WeatherCardSkeleton } from './SkeletonScreen';
import { theme } from '../../theme/theme';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('SkeletonScreen', () => {
  it('should render skeleton', () => {
    renderWithTheme(<SkeletonScreen />);
    
    expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
  });

  it('should render with text variant by default', () => {
    renderWithTheme(<SkeletonScreen />);
    
    expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
  });

  it('should render with circular variant', () => {
    renderWithTheme(<SkeletonScreen variant="circular" />);
    
    expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
  });

  it('should render with rectangular variant', () => {
    renderWithTheme(<SkeletonScreen variant="rectangular" />);
    
    expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
  });

  it('should render with custom width and height', () => {
    renderWithTheme(<SkeletonScreen width="200px" height="50px" />);
    
    expect(screen.getByTestId('skeleton-screen')).toBeInTheDocument();
  });
});

describe('WeatherCardSkeleton', () => {
  it('should render weather card skeleton', () => {
    renderWithTheme(<WeatherCardSkeleton />);
    
    expect(screen.getByTestId('weather-card-skeleton')).toBeInTheDocument();
  });

  it('should render multiple skeleton elements', () => {
    renderWithTheme(<WeatherCardSkeleton />);
    
    const skeletons = screen.getAllByTestId('skeleton-screen');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
