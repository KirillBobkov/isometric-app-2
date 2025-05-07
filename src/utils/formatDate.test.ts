import { formatDate } from './formatDate';
import { describe, it, expect } from 'vitest';

describe('formatDate', () => {
  it('корректно форматирует 1 января 2023', () => {
    expect(formatDate(Date.UTC(2023, 0, 1))).toBe('1 января 2023');
  });

  it('корректно форматирует 15 июля 2020', () => {
    expect(formatDate(Date.UTC(2020, 6, 15))).toBe('15 июля 2020');
  });

  it('корректно форматирует 31 декабря 1999', () => {
    expect(formatDate(Date.UTC(1999, 11, 31))).toBe('31 декабря 1999');
  });
}); 