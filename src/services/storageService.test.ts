import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageService } from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should return parsed value from localStorage', () => {
      const testData = { name: 'London', temp: 20 };
      localStorage.setItem('test-key', JSON.stringify(testData));

      const result = storageService.get<typeof testData>('test-key');

      expect(result).toEqual(testData);
    });

    it('should return null when key does not exist', () => {
      const result = storageService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null when JSON parsing fails', () => {
      localStorage.setItem('invalid-json', 'not valid json {');

      const result = storageService.get('invalid-json');

      expect(result).toBeNull();
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          name: 'John',
          preferences: {
            cities: ['London', 'Paris'],
            unit: 'celsius'
          }
        }
      };
      localStorage.setItem('complex', JSON.stringify(complexData));

      const result = storageService.get<typeof complexData>('complex');

      expect(result).toEqual(complexData);
    });
  });

  describe('set', () => {
    it('should store value as JSON string in localStorage', () => {
      const testData = { city: 'Paris', country: 'FR' };

      storageService.set('test-key', testData);

      const stored = localStorage.getItem('test-key');
      expect(stored).toBe(JSON.stringify(testData));
    });

    it('should handle primitive values', () => {
      storageService.set('string-key', 'hello');
      storageService.set('number-key', 42);
      storageService.set('boolean-key', true);

      expect(storageService.get('string-key')).toBe('hello');
      expect(storageService.get('number-key')).toBe(42);
      expect(storageService.get('boolean-key')).toBe(true);
    });

    it('should handle arrays', () => {
      const cities = ['London', 'Paris', 'Tokyo'];

      storageService.set('cities', cities);

      expect(storageService.get<string[]>('cities')).toEqual(cities);
    });

    it('should overwrite existing values', () => {
      storageService.set('key', 'old-value');
      storageService.set('key', 'new-value');

      expect(storageService.get('key')).toBe('new-value');
    });

    it('should handle quota exceeded error gracefully', () => {
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem');
      mockSetItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => storageService.set('key', 'value')).not.toThrow();

      mockSetItem.mockRestore();
    });
  });

  describe('remove', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test-key', 'test-value');

      storageService.remove('test-key');

      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should not throw when removing non-existent key', () => {
      expect(() => storageService.remove('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      localStorage.setItem('key3', 'value3');

      storageService.clear();

      expect(localStorage.length).toBe(0);
    });

    it('should not throw when localStorage is already empty', () => {
      expect(() => storageService.clear()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage not available', () => {
      const originalLocalStorage = global.localStorage;
      // @ts-expect-error - Testing error case
      delete global.localStorage;

      expect(() => storageService.get('key')).not.toThrow();
      expect(() => storageService.set('key', 'value')).not.toThrow();
      expect(() => storageService.remove('key')).not.toThrow();
      expect(() => storageService.clear()).not.toThrow();

      global.localStorage = originalLocalStorage;
    });
  });
});
