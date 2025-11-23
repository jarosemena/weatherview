import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { ThemeToggle } from './ThemeToggle';
import { getTheme } from '../../theme/theme';

describe('ThemeToggle', () => {
  const renderWithTheme = (
    ui: React.ReactElement,
    theme: 'light' | 'dark' = 'light'
  ) => {
    return render(
      <ThemeProvider theme={getTheme(theme)}>{ui}</ThemeProvider>
    );
  };

  describe('Rendering', () => {
    it('should render toggle button', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should display moon icon when theme is light', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🌙');
    });

    it('should display sun icon when theme is dark', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="dark" onToggle={mockToggle} />,
        'dark'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('☀️');
    });

    it('should have appropriate aria-label for light theme', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('should have appropriate aria-label for dark theme', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="dark" onToggle={mockToggle} />,
        'dark'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
    });
  });

  describe('Interaction', () => {
    it('should call onToggle when button is clicked', async () => {
      const user = userEvent.setup();
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should call onToggle multiple times on multiple clicks', async () => {
      const user = userEvent.setup();
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockToggle).toHaveBeenCalledTimes(3);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Animation', () => {
    it('should have transition styles applied', () => {
      const mockToggle = vi.fn();
      renderWithTheme(
        <ThemeToggle currentTheme="light" onToggle={mockToggle} />
      );

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);
      
      // Verificar que tiene transición (el valor exacto puede variar)
      expect(styles.transition).toBeTruthy();
    });
  });
});
