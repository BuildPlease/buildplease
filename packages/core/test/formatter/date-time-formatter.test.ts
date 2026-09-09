import { DateTimeFormatterImpl } from '@neutral/formatter/date-time-formatter';
import { DateTime } from '@neutral/model/date-time';
import { ZonedDateTime } from '@neutral/model/zoned-date-time';
import { describe, expect, it } from 'vitest';

describe('DateTimeFormatter', () => {
  const formatter = new DateTimeFormatterImpl();

  it('formats DateTime in UTC', () => {
    const value = new DateTime('2026-07-15T16:00:00Z');

    expect(
      formatter.format(value, {
        locale: 'en-GB',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    ).toBe('16:00');
  });

  it('formats ZonedDateTime in its configured time zone', () => {
    const value = ZonedDateTime.fromUtc(new DateTime('2026-07-15T16:00:00Z'), 'Europe/Bratislava');

    expect(
      formatter.format(value, {
        locale: 'en-GB',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    ).toBe('18:00');
  });

  it('uses locale only for human-readable presentation', () => {
    const value = new DateTime('2026-09-09T16:00:00Z');
    const options = { dateStyle: 'long' } as const;

    expect(formatter.format(value, { locale: 'en-US', ...options })).toBe(
      new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(value.toDate()),
    );
    expect(formatter.format(value, { locale: 'sk-SK', ...options })).toBe(
      new Intl.DateTimeFormat('sk-SK', { ...options, timeZone: 'UTC' }).format(value.toDate()),
    );
  });

  it('keeps default date-time formatting when only locale is provided', () => {
    const value = new DateTime('2026-09-09T16:00:00Z');

    expect(formatter.format(value, { locale: 'sk-SK' })).toBe(
      new Intl.DateTimeFormat('sk-SK', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(value.toDate()),
    );
  });

  it('uses a medium date and short time by default', () => {
    const value = new DateTime('2026-09-09T16:00:00Z');

    expect(formatter.format(value)).toBe(
      new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(value.toDate()),
    );
  });
});
