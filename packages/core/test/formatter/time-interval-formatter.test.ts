import { TimeIntervalFormatterImpl } from '@neutral/formatter/time-interval-formatter';
import { TimeInterval } from '@neutral/model/time-interval';
import { describe, expect, it } from 'vitest';

describe('TimeIntervalFormatter', () => {
  const formatter = new TimeIntervalFormatterImpl();

  it('formats using the largest suitable unit', () => {
    expect(formatter.format(new TimeInterval('45s'), { locale: 'en-US' })).toBe('45 seconds');
    expect(formatter.format(new TimeInterval('2h'), { locale: 'en-US' })).toBe('2 hours');
    expect(formatter.format(new TimeInterval('14d'), { locale: 'en-US' })).toBe('2 weeks');
  });

  it('preserves fractional interval values', () => {
    expect(formatter.format(new TimeInterval('90s'), { locale: 'en-US' })).toBe('1.5 minutes');
  });

  it('uses locale for human-readable presentation', () => {
    expect(formatter.format(new TimeInterval('2h'), { locale: 'sk-SK' })).toBe('2 hodiny');
  });

  it('preserves negative interval values', () => {
    expect(formatter.format(new TimeInterval('-90s'), { locale: 'en-US' })).toBe('-1.5 minutes');
  });
});
