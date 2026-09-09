import { DateTime } from '@neutral/model/date-time';
import { ZonedDateTime } from '@neutral/model/zoned-date-time';
import { describe, expect, it } from 'vitest';

describe('ZonedDateTime', () => {
  it('represents a UTC instant in an IANA time zone', () => {
    const value = ZonedDateTime.fromUtc(new DateTime('2026-07-15T16:00:00Z'), 'Europe/Bratislava');

    expect(value.toISOString()).toBe('2026-07-15T16:00:00.000Z');
    expect(value.toLocalIsoMinutes()).toBe('2026-07-15T18:00');
  });

  it('converts local summer wall-clock time to the correct UTC instant', () => {
    const value = ZonedDateTime.fromLocalIso('2026-07-15T18:00', 'Europe/Bratislava');

    expect(value.toISOString()).toBe('2026-07-15T16:00:00.000Z');
    expect(value.timezoneOffsetMs()).toBe(2 * 60 * 60 * 1000);
  });

  it('converts local winter wall-clock time using the DST-aware offset', () => {
    const value = ZonedDateTime.fromLocalIso('2026-01-15T18:00', 'Europe/Bratislava');

    expect(value.toISOString()).toBe('2026-01-15T17:00:00.000Z');
    expect(value.timezoneOffsetMs()).toBe(60 * 60 * 1000);
  });

  it('rejects a nonexistent local time during the DST spring gap', () => {
    expect(() => ZonedDateTime.fromLocalIso('2026-03-29T02:30', 'Europe/Bratislava')).toThrow(
      'Local date-time does not exist in time zone',
    );
  });

  it('rejects an ambiguous local time during the DST autumn overlap', () => {
    expect(() => ZonedDateTime.fromLocalIso('2026-10-25T02:30', 'Europe/Bratislava')).toThrow(
      'Local date-time is ambiguous in time zone',
    );
  });

  it('accepts valid local times immediately around a DST spring gap', () => {
    expect(ZonedDateTime.fromLocalIso('2026-03-29T01:59', 'Europe/Bratislava').toISOString()).toBe(
      '2026-03-29T00:59:00.000Z',
    );

    expect(ZonedDateTime.fromLocalIso('2026-03-29T03:00', 'Europe/Bratislava').toISOString()).toBe(
      '2026-03-29T01:00:00.000Z',
    );
  });

  it('accepts valid local times immediately around a DST autumn overlap', () => {
    expect(ZonedDateTime.fromLocalIso('2026-10-25T01:59', 'Europe/Bratislava').toISOString()).toBe(
      '2026-10-24T23:59:00.000Z',
    );

    expect(ZonedDateTime.fromLocalIso('2026-10-25T03:00', 'Europe/Bratislava').toISOString()).toBe(
      '2026-10-25T02:00:00.000Z',
    );
  });

  it('supports time zones with non-hour offsets', () => {
    const value = ZonedDateTime.fromLocalIso('2026-07-15T18:00', 'Asia/Kathmandu');

    expect(value.toISOString()).toBe('2026-07-15T12:15:00.000Z');
    expect(value.timezoneOffsetMs()).toBe(5.75 * 60 * 60 * 1000);
  });

  it('rejects ambiguous local times with non-hour DST transitions', () => {
    expect(() => ZonedDateTime.fromLocalIso('2026-04-05T01:45', 'Australia/Lord_Howe')).toThrow(
      'Local date-time is ambiguous in time zone',
    );
  });

  it('changes time zone without changing the instant', () => {
    const bratislava = ZonedDateTime.fromUtc(new DateTime('2026-07-15T16:00:00Z'), 'Europe/Bratislava');

    const newYork = bratislava.withTimeZone('America/New_York');

    expect(newYork.toISOString()).toBe(bratislava.toISOString());
    expect(bratislava.toLocalIsoMinutes()).toBe('2026-07-15T18:00');
    expect(newYork.toLocalIsoMinutes()).toBe('2026-07-15T12:00');
  });

  it('does not expose mutable instant state', () => {
    const input = new Date('2026-07-15T16:00:00.000Z');
    const value = ZonedDateTime.fromUtc(input, 'Europe/Bratislava');

    input.setUTCFullYear(1900);
    value.utc.setUTCFullYear(1900);
    value.toDate().setUTCFullYear(1900);

    expect(value.toISOString()).toBe('2026-07-15T16:00:00.000Z');
  });

  it('rejects invalid time-zone identifiers', () => {
    const instant = new Date('2026-01-01T00:00:00.000Z');

    expect(() => ZonedDateTime.fromUtc(instant, 'Not/A_Time_Zone')).toThrow('Invalid IANA time zone: Not/A_Time_Zone');

    expect(() => ZonedDateTime.fromUtc(instant, '+02:00')).toThrow('Invalid IANA time zone: +02:00');
  });

  it('rejects local input that already contains an offset', () => {
    expect(() => ZonedDateTime.fromLocalIso('2026-07-15T18:00:00+02:00', 'Europe/Bratislava')).toThrow(
      'Local date-time must not contain a UTC offset',
    );

    expect(() => ZonedDateTime.fromLocalIso('2026-07-15T16:00:00Z', 'Europe/Bratislava')).toThrow(
      'Local date-time must not contain a UTC offset',
    );
  });

  it('throws for invalid local date-time input', () => {
    expect(() => ZonedDateTime.fromLocalIso('not-a-date', 'Europe/Bratislava')).toThrow(
      'Invalid local date-time string',
    );
  });
});
