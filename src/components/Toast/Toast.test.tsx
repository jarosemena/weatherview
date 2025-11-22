import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import userEvent from '@testing-library/user-event';
import { Toast } from './Toast';
import { theme } from '../../theme/theme';

function renderWithTheme(component: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
}

describe('Toast', () => {
  it('should render toast with message', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast id="test-1" type="info" message="Test message" onClose={onClose} />
    );
    
    expect(screen.getByTestId('toast-test-1')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render success toast with correct icon', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast id="test-1" type="success" message="Success!" onClose={onClose} />
    );
    
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render error toast with correct icon', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast id="test-1" type="error" message="Error!" onClose={onClose} />
    );
    
    expect(screen.getAllByText('⚠')[0]).toBeInTheDocument();
  });

  it('should render warning toast with correct icon', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast id="test-1" type="warning" message="Warning!" onClose={onClose} />
    );
    
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('should render info toast with correct icon', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <Toast id="test-1" type="info" message="Info!" onClose={onClose} />
    );
    
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    renderWithTheme(
      <Toast id="test-1" type="info" message="Test" onClose={onClose} />
    );
    
    const closeButton = screen.getByLabelText('Close notification');
    await user.click(closeButton);
    
    expect(onClose).toHaveBeenCalledWith('test-1');
  });

  it('should auto-close after duration', async () => {
    const onClose = vi.fn();
    
    renderWithTheme(
      <Toast id="test-1" type="info" message="Test" duration={100} onClose={onClose} />
    );
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith('test-1');
    }, { timeout: 200 });
  });

  it('should use default duration of 5000ms', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    renderWithTheme(
      <Toast id="test-1" type="info" message="Test" onClose={onClose} />
    );
    
    expect(onClose).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(4999);
    expect(onClose).not.toHaveBeenCalled();
    
    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledWith('test-1');
    
    vi.useRealTimers();
  });
});
