import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { LoadingSpinner } from './LoadingSpinner';
import { theme } from '../../theme/theme';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    renderWithTheme(<LoadingSpinner />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render with message when provided', () => {
    renderWithTheme(<LoadingSpinner message="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should not render message when not provided', () => {
    const { container } = renderWithTheme(<LoadingSpinner />);
    
    const message = container.querySelector('p');
    expect(message).not.toBeInTheDocument();
  });

  it('should render with small size', () => {
    renderWithTheme(<LoadingSpinner size="small" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render with medium size by default', () => {
    renderWithTheme(<LoadingSpinner />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render with large size', () => {
    renderWithTheme(<LoadingSpinner size="large" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
