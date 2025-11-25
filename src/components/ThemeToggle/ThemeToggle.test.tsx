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

  describe('Property-Based Tests', () => {
    /**
     * Feature: weather-data-visualizer, Property 1: Theme toggle switches state
     * Validates: Requirements 11.2
     */
    it(
      'Property 1: theme toggle should always switch to opposite theme',
      async () => {
        const fc = await import('fast-check');

        await fc.assert(
          fc.asyncProperty(
            fc.constantFrom('light' as const, 'dark' as const),
            async (initialTheme) => {
              const user = userEvent.setup();
              let currentTheme = initialTheme;
              const mockToggle = vi.fn(() => {
                currentTheme = currentTheme === 'light' ? 'dark' : 'light';
              });

              const { unmount, rerender } = renderWithTheme(
                <ThemeToggle currentTheme={currentTheme} onToggle={mockToggle} />,
                currentTheme
              );

              const button = screen.getByRole('button');
              await user.click(button);

              // Verificar que se llamó el toggle
              expect(mockToggle).toHaveBeenCalledTimes(1);

              // Verificar que el tema cambió al opuesto
              const expectedTheme = initialTheme === 'light' ? 'dark' : 'light';
              expect(currentTheme).toBe(expectedTheme);

              // Verificar que el icono cambió
              rerender(
                <ThemeProvider theme={getTheme(currentTheme)}>
                  <ThemeToggle currentTheme={currentTheme} onToggle={mockToggle} />
                </ThemeProvider>
              );

              const expectedIcon = expectedTheme === 'light' ? '🌙' : '☀️';
              expect(button).toHaveTextContent(expectedIcon);

              // Limpiar el DOM para la siguiente iteración
              unmount();
            }
          ),
          { numRuns: 20 }
        );
      },
      15000
    );
  });
});
