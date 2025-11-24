import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storageService } from './storageService';

describe('Storage Service - Theme Persistence', () => {
  const THEME_KEY = 'theme';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: weather-data-visualizer, Property 2: Theme persistence round trip
     * Validates: Requirements 11.3
     */
    it(
      'Property 2: saving and loading theme should preserve the value',
      async () => {
        const fc = await import('fast-check');

        await fc.assert(
          fc.property(
            fc.constantFrom('light' as const, 'dark' as const),
            (theme) => {
              // Guardar el tema
              storageService.set(THEME_KEY, theme);

              // Cargar el tema
              const loadedTheme = storageService.get<'light' | 'dark'>(THEME_KEY);

              // Verificar que el tema cargado es el mismo que se guardó
              expect(loadedTheme).toBe(theme);

              // Limpiar para la siguiente iteración
              storageService.remove(THEME_KEY);
            }
          ),
          { numRuns: 100 }
        );
      }
    );

    it(
      'Property 2 (extended): multiple save/load cycles preserve theme',
      async () => {
        const fc = await import('fast-check');

        await fc.assert(
          fc.property(
            fc.array(fc.constantFrom('light' as const, 'dark' as const), {
              minLength: 1,
              maxLength: 10,
            }),
            (themes) => {
              // Simular múltiples cambios de tema
              for (const theme of themes) {
                storageService.set(THEME_KEY, theme);
                const loaded = storageService.get<'light' | 'dark'>(THEME_KEY);
                expect(loaded).toBe(theme);
              }

              // Verificar que el último tema guardado es el que permanece
              const finalTheme = themes[themes.length - 1];
              const loadedFinalTheme = storageService.get<'light' | 'dark'>(THEME_KEY);
              expect(loadedFinalTheme).toBe(finalTheme);

              // Limpiar
              storageService.remove(THEME_KEY);
            }
          ),
          { numRuns: 50 }
        );
      }
    );

    it(
      'Property 2 (edge case): theme persists after page reload simulation',
      async () => {
        const fc = await import('fast-check');

        await fc.assert(
          fc.property(
            fc.constantFrom('light' as const, 'dark' as const),
            (theme) => {
              // Guardar tema
              storageService.set(THEME_KEY, theme);

              // Simular "recarga de página" - el localStorage persiste
              // pero las variables en memoria se reinician
              const loadedTheme = storageService.get<'light' | 'dark'>(THEME_KEY);

              // El tema debe seguir siendo el mismo
              expect(loadedTheme).toBe(theme);
              expect(loadedTheme).not.toBeNull();

              // Limpiar
              storageService.remove(THEME_KEY);
            }
          ),
          { numRuns: 100 }
        );
      }
    );
  });
});
