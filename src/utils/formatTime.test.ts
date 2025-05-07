import { formatTime } from './formatTime';
import { describe, it, expect } from 'vitest';

describe('formatTime', () => {
  it('форматирует 0 мс как 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('форматирует 61_000 мс как 01:01', () => {
    expect(formatTime(61_000)).toBe('01:01');
  });

  it('форматирует 3_661_000 мс как 01:01:01', () => {
    expect(formatTime(3_661_000)).toBe('01:01:01');
  });
}); 