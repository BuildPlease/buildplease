import { utc, UTCDate } from '@date-fns/utc';
import type { JSONSerializable } from '@neutral/utils';
import {
  type Duration,
  type FormatOptions,
  type FromUnixTimeOptions,
  add,
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  compareAsc,
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  differenceInWeeks,
  differenceInYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format as formatDate,
  fromUnixTime,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getUnixTime,
  getYear,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isValid,
  parseISO,
  setDate,
  setDay,
  setHours,
  setMinutes,
  setMonth,
  setSeconds,
  setYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  sub,
  subDays,
  subHours,
  subMilliseconds,
  subMinutes,
  subMonths,
  subSeconds,
  subWeeks,
  subYears,
} from 'date-fns';

/**
 * Represents an immutable UTC date-time instant.
 *
 * @remarks
 * Date-only and date-time strings without an explicit offset are interpreted as
 * UTC. Inputs with an explicit offset are normalized to UTC. All calendar
 * operations use UTC semantics and do not depend on the runtime machine time
 * zone.
 *
 * Native `Date` values are copied on input and output so external mutation
 * cannot change this value.
 *
 * @example
 * const now = new DateTime();
 * // Current instant, represented in UTC.
 *
 * @example
 * const sameNow = DateTime.now();
 * // Equivalent convenience factory for the current UTC instant.
 *
 * @example
 * const date = new DateTime('2026-09-09');
 * date.toISOString();
 * // "2026-09-09T00:00:00.000Z"
 *
 * @example
 * const date = new DateTime('2026-09-09T18:00:00');
 * date.toISOString();
 * // "2026-09-09T18:00:00.000Z"
 *
 * @example
 * const date = new DateTime('2026-09-09T20:00:00+02:00');
 * date.toISOString();
 * // "2026-09-09T18:00:00.000Z"
 *
 * @throws {Error}
 * When the provided input cannot be parsed as a valid date-time.
 */
export class DateTime implements JSONSerializable {
  private readonly date: UTCDate;

  /**
   * Creates a UTC date-time value.
   *
   * @param input
   * A native `Date` or ISO-format string. Omit to use the current instant.
   * Date-only and date-time strings without an offset are interpreted as UTC.
   *
   * @throws {Error}
   * When `input` is an invalid `Date` or cannot be parsed as an ISO date-time.
   */
  public constructor(input?: Date | string) {
    if (input === undefined) {
      this.date = new UTCDate();
      return;
    }

    if (input instanceof Date) {
      if (!isValid(input)) throw new Error('Invalid date object');
      this.date = new UTCDate(input.getTime());
      return;
    }

    const parsed = parseISO(input, { in: utc });
    if (!isValid(parsed)) throw new Error('Invalid date string');

    this.date = new UTCDate(parsed.getTime());
  }

  /** Creates a `DateTime` from a Unix timestamp expressed in seconds. */
  public static fromUnixTimestamp(unixTimestamp: number, options?: FromUnixTimeOptions): DateTime {
    return new DateTime(fromUnixTime(unixTimestamp, { ...options, in: utc }));
  }

  /** Returns the current instant as a UTC `DateTime`. */
  public static now(): DateTime {
    return new DateTime();
  }

  /** Serializes this instant as a canonical UTC ISO-8601 string. */
  public toJSON(): string {
    return this.toISOString();
  }

  // MARK: - Converters

  /** Returns a defensive native `Date` copy representing the same instant. */
  public toDate(): Date {
    return new Date(this.date.getTime());
  }

  /** Returns the Unix timestamp in seconds. */
  public toUnixTimestamp(): number {
    return getUnixTime(this.date);
  }

  /** Returns the time value in milliseconds since the Unix epoch. */
  public getTime(): number {
    return this.date.getTime();
  }

  /** Returns a canonical ISO-8601 representation in UTC using the `Z` suffix. */
  public toISOString(): string {
    return this.date.toISOString();
  }

  /**
   * Formats this value in UTC using a date-fns pattern.
   *
   * @remarks
   * This legacy pattern-based API always formats in UTC. Prefer the
   * `DateTimeFormatter` for human-readable application output.
   *
   * @param pattern
   * A date-fns format string or `DateFormat` value.
   *
   * @param options
   * Optional date-fns formatting options.
   */
  public format(pattern: DateFormat | string, options?: FormatOptions): string {
    return formatDate(this.date, pattern, { ...options, in: utc });
  }

  // MARK: - Adding Durations

  public addingDuration(duration: Duration): DateTime {
    return new DateTime(add(this.date, duration));
  }
  public addingMilliseconds(msCount: number): DateTime {
    return new DateTime(addMilliseconds(this.date, msCount));
  }
  public addingSeconds(sec: number): DateTime {
    return new DateTime(addSeconds(this.date, sec));
  }
  public addingMinutes(min: number): DateTime {
    return new DateTime(addMinutes(this.date, min));
  }
  public addingHours(hr: number): DateTime {
    return new DateTime(addHours(this.date, hr));
  }
  public addingDays(d: number): DateTime {
    return new DateTime(addDays(this.date, d));
  }
  public addingWeeks(w: number): DateTime {
    return new DateTime(addWeeks(this.date, w));
  }
  public addingMonths(m: number): DateTime {
    return new DateTime(addMonths(this.date, m));
  }
  public addingYears(y: number): DateTime {
    return new DateTime(addYears(this.date, y));
  }

  // MARK: - Subtracting Durations

  public subtractingDuration(duration: Duration): DateTime {
    return new DateTime(sub(this.date, duration));
  }
  public subtractingMilliseconds(msCount: number): DateTime {
    return new DateTime(subMilliseconds(this.date, msCount));
  }
  public subtractingSeconds(sec: number): DateTime {
    return new DateTime(subSeconds(this.date, sec));
  }
  public subtractingMinutes(min: number): DateTime {
    return new DateTime(subMinutes(this.date, min));
  }
  public subtractingHours(hr: number): DateTime {
    return new DateTime(subHours(this.date, hr));
  }
  public subtractingDays(d: number): DateTime {
    return new DateTime(subDays(this.date, d));
  }
  public subtractingWeeks(w: number): DateTime {
    return new DateTime(subWeeks(this.date, w));
  }
  public subtractingMonths(m: number): DateTime {
    return new DateTime(subMonths(this.date, m));
  }
  public subtractingYears(y: number): DateTime {
    return new DateTime(subYears(this.date, y));
  }

  // MARK: - Differences

  public differenceInMilliseconds(other: DateTime): number {
    return differenceInMilliseconds(this.date, other.date);
  }
  public differenceInSeconds(other: DateTime): number {
    return differenceInSeconds(this.date, other.date);
  }
  public differenceInMinutes(other: DateTime): number {
    return differenceInMinutes(this.date, other.date);
  }
  public differenceInHours(other: DateTime): number {
    return differenceInHours(this.date, other.date);
  }
  public differenceInDays(other: DateTime): number {
    return differenceInDays(this.date, other.date);
  }
  public differenceInWeeks(other: DateTime): number {
    return differenceInWeeks(this.date, other.date);
  }
  public differenceInMonths(other: DateTime): number {
    return differenceInMonths(this.date, other.date);
  }
  public differenceInYears(other: DateTime): number {
    return differenceInYears(this.date, other.date);
  }

  // MARK: - Comparisons

  public isEqualTo(other: DateTime): boolean {
    return isEqual(this.date, other.date);
  }
  public isBefore(other: DateTime): boolean {
    return isBefore(this.date, other.date);
  }
  public isAfter(other: DateTime): boolean {
    return isAfter(this.date, other.date);
  }
  public compareTo(other: DateTime): number {
    return compareAsc(this.date, other.date);
  }
  public isSameDayAs(other: DateTime): boolean {
    return isSameDay(this.date, other.date, { in: utc });
  }

  // MARK: - Interval Boundaries

  public startOfDay(): DateTime {
    return new DateTime(startOfDay(this.date));
  }
  public endOfDay(): DateTime {
    return new DateTime(endOfDay(this.date));
  }
  public startOfWeek(): DateTime {
    return new DateTime(startOfWeek(this.date));
  }
  public endOfWeek(): DateTime {
    return new DateTime(endOfWeek(this.date));
  }
  public startOfMonth(): DateTime {
    return new DateTime(startOfMonth(this.date));
  }
  public endOfMonth(): DateTime {
    return new DateTime(endOfMonth(this.date));
  }
  public startOfYear(): DateTime {
    return new DateTime(startOfYear(this.date));
  }
  public endOfYear(): DateTime {
    return new DateTime(endOfYear(this.date));
  }

  // MARK: - Getters

  /** UTC day of month in the range 1–31. */
  public get dayOfMonth(): number {
    return getDate(this.date);
  }
  /** UTC day of week in the range 0–6, where 0 is Sunday. */
  public get dayOfWeek(): number {
    return getDay(this.date);
  }
  /** UTC month in the range 0–11. */
  public get month(): number {
    return getMonth(this.date);
  }
  /** UTC year. */
  public get year(): number {
    return getYear(this.date);
  }
  /** UTC hour in the range 0–23. */
  public get hours(): number {
    return getHours(this.date);
  }
  /** UTC minutes in the range 0–59. */
  public get minutes(): number {
    return getMinutes(this.date);
  }
  /** UTC seconds in the range 0–59. */
  public get seconds(): number {
    return getSeconds(this.date);
  }

  // MARK: - Setters (Immutable)

  /** Returns a new value with the UTC day of month set to `day`. */
  public settingDayOfMonth(day: number): DateTime {
    return new DateTime(setDate(this.date, day));
  }

  /** Returns a new value with the UTC day of week set to `day`. */
  public settingDayOfWeek(day: number): DateTime {
    return new DateTime(setDay(this.date, day));
  }

  /** Returns a new value with the UTC month set to `month` (0–11). */
  public settingMonth(month: number): DateTime {
    return new DateTime(setMonth(this.date, month));
  }

  /** Returns a new value with the UTC year set to `year`. */
  public settingYear(year: number): DateTime {
    return new DateTime(setYear(this.date, year));
  }

  /** Returns a new value with the UTC hour set to `hours` (0–23). */
  public settingHours(hours: number): DateTime {
    return new DateTime(setHours(this.date, hours));
  }

  /** Returns a new value with the UTC minutes set to `minutes` (0–59). */
  public settingMinutes(minutes: number): DateTime {
    return new DateTime(setMinutes(this.date, minutes));
  }

  /** Returns a new value with the UTC seconds set to `seconds` (0–59). */
  public settingSeconds(seconds: number): DateTime {
    return new DateTime(setSeconds(this.date, seconds));
  }
}

export enum DateFormat {
  /** ISO date only (yyyy-MM-dd), e.g. "2025-06-05". */
  ISO_DATE = 'yyyy-MM-dd',

  /** ISO date + time with UTC offset, e.g. "2025-06-05T13:24:00Z". */
  ISO_DATETIME = "yyyy-MM-dd'T'HH:mm:ssXXX",

  /** Month/day/year, e.g. "06/05/2025". */
  MM_DD_YYYY = 'MM/dd/yyyy',

  /** Full month name + day + year, e.g. "June 5, 2025". */
  FULL_MONTH_DAY_YEAR = 'MMMM d, yyyy',

  /** Abbreviated month + day + year, e.g. "Jun 5, 2025". */
  ABBR_MONTH_DAY_YEAR = 'MMM d, yyyy',

  /** RFC-3339 with milliseconds, e.g. "2025-06-05T13:24:00.000Z". */
  RFC_3339 = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",

  /** Alternative RSS date. */
  ALT_RSS = 'd MMM yyyy HH:mm:ss ZZZ',

  /** Standard RSS date. */
  RSS = 'EEE, d MMM yyyy HH:mm:ss ZZZ',

  /** HTTP header date. */
  HTTP_HEADER = 'EEE, dd MMM yyyy HH:mm:ss zzz',

  /** Generic standard date-time format. */
  STANDARD = 'EEE MMM dd HH:mm:ss Z yyyy',

  /** Extended date-time format. */
  EXTENDED = 'eee dd-MMM-yyyy GG HH:mm:ss.SSS zzz',
}
