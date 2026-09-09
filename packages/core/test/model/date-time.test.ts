import { DateFormat, DateTime } from '@neutral/model/date-time';
import { describe, expect, it } from 'vitest';

describe('DateTime', () => {
  it('creates the current UTC instant when input is omitted', () => {
    const before = Date.now();
    const value = new DateTime();
    const after = Date.now();

    expect(value.getTime()).toBeGreaterThanOrEqual(before);
    expect(value.getTime()).toBeLessThanOrEqual(after);
    expect(value.toISOString()).toMatch(/Z$/u);
  });

  it('creates the current UTC instant via DateTime.now()', () => {
    const before = Date.now();
    const value = DateTime.now();
    const after = Date.now();

    expect(value.getTime()).toBeGreaterThanOrEqual(before);
    expect(value.getTime()).toBeLessThanOrEqual(after);
    expect(value.toISOString()).toMatch(/Z$/u);
  });

  it('interprets date-only input as UTC midnight', () => {
    expect(new DateTime('2026-09-09').toISOString()).toBe('2026-09-09T00:00:00.000Z');
  });

  it('interprets timezone-less date-time input as UTC', () => {
    expect(new DateTime('2026-09-09T18:00:00').toISOString()).toBe('2026-09-09T18:00:00.000Z');
  });

  it('normalizes explicit offsets to UTC', () => {
    expect(new DateTime('2026-09-09T20:00:00+02:00').toISOString()).toBe('2026-09-09T18:00:00.000Z');
    expect(new DateTime('2026-09-09T13:00:00-05:00').toISOString()).toBe('2026-09-09T18:00:00.000Z');
  });

  it('serializes as canonical UTC', () => {
    const value = new DateTime('2026-09-09T20:00:00+02:00');

    expect(value.toISOString()).toBe('2026-09-09T18:00:00.000Z');
    expect(value.toJSON()).toBe('2026-09-09T18:00:00.000Z');
  });

  it('copies native Date input', () => {
    const input = new Date('2026-09-09T18:00:00.000Z');
    const value = new DateTime(input);

    input.setUTCFullYear(1900);

    expect(value.toISOString()).toBe('2026-09-09T18:00:00.000Z');
  });

  it('returns a defensive Date copy', () => {
    const value = new DateTime('2026-09-09T18:00:00Z');
    const output = value.toDate();

    output.setUTCFullYear(1900);

    expect(value.toISOString()).toBe('2026-09-09T18:00:00.000Z');
  });

  it('uses UTC semantics for getters and immutable setters', () => {
    const value = new DateTime('2026-09-09T23:45:30-05:00');

    expect(value.toISOString()).toBe('2026-09-10T04:45:30.000Z');
    expect(value.year).toBe(2026);
    expect(value.month).toBe(8);
    expect(value.dayOfMonth).toBe(10);
    expect(value.hours).toBe(4);
    expect(value.minutes).toBe(45);
    expect(value.seconds).toBe(30);
    expect(value.settingHours(18).toISOString()).toBe('2026-09-10T18:45:30.000Z');
    expect(value.toISOString()).toBe('2026-09-10T04:45:30.000Z');
  });

  it('uses UTC semantics for calendar boundaries and arithmetic', () => {
    const value = new DateTime('2026-03-29T23:30:00Z');

    expect(value.startOfDay().toISOString()).toBe('2026-03-29T00:00:00.000Z');
    expect(value.endOfDay().toISOString()).toBe('2026-03-29T23:59:59.999Z');
    expect(value.addingDays(1).toISOString()).toBe('2026-03-30T23:30:00.000Z');
    expect(value.subtractingDays(1).toISOString()).toBe('2026-03-28T23:30:00.000Z');
    expect(value.addingHours(2).differenceInHours(value)).toBe(2);
  });

  it('compares UTC calendar days independently from input offsets', () => {
    const first = new DateTime('2026-09-09T23:30:00-02:00');
    const second = new DateTime('2026-09-10T20:00:00+09:00');

    expect(first.isSameDayAs(second)).toBe(true);
  });

  it('formats the legacy pattern API in UTC', () => {
    const value = new DateTime('2026-09-09T20:00:00+02:00');

    expect(value.format(DateFormat.ISO_DATETIME)).toBe('2026-09-09T18:00:00Z');
  });

  it('creates values from Unix timestamps in UTC', () => {
    expect(DateTime.fromUnixTimestamp(0).toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });

  it('throws for invalid input', () => {
    expect(() => new DateTime('')).toThrow('Invalid date string');
    expect(() => new DateTime('not-a-date')).toThrow('Invalid date string');
    expect(() => new DateTime(new Date(Number.NaN))).toThrow('Invalid date object');
  });
});
