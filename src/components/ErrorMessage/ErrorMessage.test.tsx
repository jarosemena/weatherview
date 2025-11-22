import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';
import { theme } from '../../theme/theme';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('ErrorMessage', () => {
  it('should render error message', () => {
    renderWithTheme(<ErrorMessage message="Test error message" />);
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render with default title', () => {
    renderWithTheme(<ErrorMessage message="Test error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    renderWithTheme(<ErrorMessage title="Network Error" message="Test error" />);
    
    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('should render retry button by default', () => {
    const onRetry = vi.fn();
    renderWithTheme(<ErrorMessage message="Test error" onRetry={onRetry} />);
    
    expect(screen.getByTestId('retry-button')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    
    renderWithTheme(<ErrorMessage message="Test error" onRetry={onRetry} />);
    
    const retryButton = screen.getByTestId('retry-button');
    await user.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not render retry button when showRetry is false', () => {
    const onRetry = vi.fn();
    renderWithTheme(<ErrorMessage message="Test error" onRetry={onRetry} showRetry={false} />);
    
    expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    renderWithTheme(<ErrorMessage message="Test error" />);
    
    expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
  });

  it('should render error icon', () => {
    renderWithTheme(<ErrorMessage message="Test error" />);
    
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
