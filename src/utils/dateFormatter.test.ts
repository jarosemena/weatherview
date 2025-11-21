import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatDateTime, formatRelativeTime } from './dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2023-11-15T12:30:00');
      expect(formatDate(date)).toBe('2023-11-15');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2023-01-05T12:30:00');
      expect(formatDate(date)).toBe('2023-01-05');
    });

    it('should format timestamp', () => {
      const timestamp = new Date('2023-11-15T12:30:00').getTime() / 1000;
      expect(formatDate(timestamp)).toBe('2023-11-15');
    });
  });

  describe('formatTime', () => {
    it('should format time as HH:MM', () => {
      const date = new Date('2023-11-15T14:30:00');
      expect(formatTime(date)).toBe('14:30');
    });

    it('should handle single digit hours and minutes', () => {
      const date = new Date('2023-11-15T09:05:00');
      expect(formatTime(date)).toBe('09:05');
    });

    it('should format timestamp', () => {
      const timestamp = new Date('2023-11-15T14:30:00').getTime() / 1000;
      expect(formatTime(timestamp)).toBe('14:30');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2023-11-15T14:30:00');
      expect(formatDateTime(date)).toBe('2023-11-15 14:30');
    });

    it('should format timestamp', () => {
      const timestamp = new Date('2023-11-15T14:30:00').getTime() / 1000;
      expect(formatDateTime(timestamp)).toBe('2023-11-15 14:30');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "just now" for times less than a minute ago', () => {
      const now = Date.now();
      const thirtySecondsAgo = new Date(now - 30 * 1000);
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const now = Date.now();
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });

    it('should return 1 minute ago (singular)', () => {
      const now = Date.now();
      const oneMinuteAgo = new Date(now - 1 * 60 * 1000);
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should return hours ago', () => {
      const now = Date.now();
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
    });

    it('should return 1 hour ago (singular)', () => {
      const now = Date.now();
      const oneHourAgo = new Date(now - 1 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
    });

    it('should return days ago', () => {
      const now = Date.now();
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });

    it('should return 1 day ago (singular)', () => {
      const now = Date.now();
      const oneDayAgo = new Date(now - 1 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
    });

    it('should return formatted date for times more than 7 days ago', () => {
      const now = Date.now();
      const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(tenDaysAgo);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should handle timestamp input', () => {
      const now = Date.now();
      const fiveMinutesAgo = (now - 5 * 60 * 1000) / 1000;
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
    });
  });
});
