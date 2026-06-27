import { describe, expect, it } from 'vitest';

import { TimeInterval } from '@/model/time-interval';

import { makeInterval } from './fixtures';

describe('TimeInterval', () => {
  it('parses compact string intervals', () => {
    const interval = makeInterval('5m');

    expect(interval.milliseconds).toBe(300_000);
    expect(interval.seconds).toBe(300);
    expect(interval.minutes).toBe(5);
    expect(interval.toString()).toBe('5m');
  });

  it('uses numeric input as milliseconds', () => {
    const interval = makeInterval(90_000);

    expect(interval.milliseconds).toBe(90_000);
    expect(interval.seconds).toBe(90);
    expect(interval.minutes).toBe(1);
  });

  it('formats long output when requested', () => {
    const interval = new TimeInterval('1h', { long: true });

    expect(interval.toString()).toBe('1 hour');
  });

  it('returns all units as an object', () => {
    const interval = makeInterval('1w');

    expect(interval.toObject()).toEqual({
      milliseconds: 604_800_000,
      seconds: 604_800,
      minutes: 10_080,
      hours: 168,
      days: 7,
      weeks: 1,
    });
  });

  it('throws for empty or invalid intervals', () => {
    expect(() => new TimeInterval(undefined)).toThrow('Invalid interval format: undefined');
    expect(() => new TimeInterval(null)).toThrow('Invalid interval format: null');
    expect(() => new TimeInterval('invalid')).toThrow('Invalid interval format: invalid');
  });
});
