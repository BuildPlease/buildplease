export * from 'date-fns';

import type { Duration, Locale } from 'date-fns';
import {
  add,
  sub,
  format as formatDate,
  parseISO,
  parse,
  differenceInMilliseconds,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  isValid,
  getUnixTime,
  fromUnixTime,
  compareAsc,
  isEqual,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMilliseconds,
  addSeconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subMilliseconds,
  subSeconds,
  subMinutes,
  subHours,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  getDate,
  getDay,
  getMonth,
  getYear,
  setDate,
  setDay,
  setMonth,
  setYear,
  getHours,
  getMinutes,
  getSeconds,
  setHours,
  setMinutes,
  setSeconds,
  formatISO,
} from 'date-fns';

/**
 * A date-and-time utility class offering parsing, formatting, and arithmetic.
 *
 * - Instantiate with no arguments for current date/time.
 * - Instantiate with a `Date` or ISO-format string to wrap that moment.
 *
 * @throws {Error} If the provided date input is invalid.
 *
 * @example
 * const now = new DateTime();
 * const fromDate = new DateTime(new Date('2022-12-12'));
 * const fromIso  = new DateTime('2022-12-12T00:00:00Z');
 */
export class DateTime {
  private readonly date: Date;

  /**
   * @param {Date | string} [input]
   *   A Date object or ISO-format date string. Omit to use current date/time.
   * @throws {Error}
   *   If `input` is neither a valid Date nor a parseable string.
   */
  public constructor(input?: Date | string) {
    if (!input) {
      this.date = new Date();
      return;
    }

    if (input instanceof Date) {
      if (!isValid(input)) throw new Error('Invalid Date object');
      this.date = input;
    } else {
      const parsed = parseISO(input);
      if (!isValid(parsed)) throw new Error('Invalid date string');
      this.date = parsed;
    }
  }

  // MARK: - Static Factory Methods

  /**
   * Creates a DateTime from a Date object.
   *
   * @param {Date} date
   * @returns {DateTime | null} Null if invalid.
   */
  public static fromDate(date: Date): DateTime | null {
    return isValid(date) ? new DateTime(date) : null;
  }

  /**
   * Parses a string into DateTime.
   *
   * @param {string} dateString
   * @param {string} [formatString]
   * @param {Date} [referenceDate=new Date()]
   * @returns {DateTime | null} Null if parsing fails.
   */
  public static fromString(
    dateString: string,
    formatString?: string,
    referenceDate: Date = new Date(),
  ): DateTime | null {
    const date = formatString
      ? parse(dateString, formatString, referenceDate)
      : parseISO(dateString);
    return isValid(date) ? new DateTime(date) : null;
  }

  /**
   * Now.
   *
   * @returns {DateTime}
   */
  public static now(): DateTime {
    return new DateTime(new Date());
  }

  /**
   * From Unix timestamp (seconds).
   *
   * @param {number} unixTimestamp
   * @returns {DateTime}
   */
  public static fromUnixTimestamp(unixTimestamp: number): DateTime {
    return new DateTime(fromUnixTime(unixTimestamp));
  }

  // MARK: - Converters

  /**
   * To JavaScript Date.
   *
   * @returns {Date}
   */
  public toDate(): Date {
    return this.date;
  }

  /**
   * To Unix timestamp (seconds).
   *
   * @returns {number}
   */
  public toUnixTimestamp(): number {
    return getUnixTime(this.date);
  }

  /**
   * To ISO 8601 string.
   *
   * @returns {string}
   */
  public toISOString(): string {
    return formatISO(this.date);
  }

  /**
   * Format with a pattern.
   *
   * @param {string} pattern
   * @param {{ locale?: Locale }} [options]
   * @returns {string}
   */
  public format(pattern: string, options?: { locale?: Locale }): string {
    return formatDate(this.date, pattern, options);
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
    return isSameDay(this.date, other.date);
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

  /** Day of month (1–31). */
  public get dayOfMonth(): number {
    return getDate(this.date);
  }
  /** Day of week (0–6, 0 = Sunday). */
  public get dayOfWeek(): number {
    return getDay(this.date);
  }
  /** Month (0–11). */
  public get month(): number {
    return getMonth(this.date);
  }
  /** Year. */
  public get year(): number {
    return getYear(this.date);
  }
  /** Hours (0–23). */
  public get hours(): number {
    return getHours(this.date);
  }
  /** Minutes (0–59). */
  public get minutes(): number {
    return getMinutes(this.date);
  }
  /** Seconds (0–59). */
  public get seconds(): number {
    return getSeconds(this.date);
  }

  // MARK: - Setters (Immutable)

  /**
   * Sets the day of the month.
   *
   * @param {number} day  Day of the month (1–31).
   * @returns {DateTime}
   */
  public settingDayOfMonth(day: number): DateTime {
    return new DateTime(setDate(this.date, day));
  }

  /**
   * Sets the day of the week.
   *
   * @param {number} day  Day of the week (0–6, 0 = Sunday).
   * @returns {DateTime}
   */
  public settingDayOfWeek(day: number): DateTime {
    return new DateTime(setDay(this.date, day));
  }

  /**
   * Sets the month.
   *
   * @param {number} month  Month (0–11).
   * @returns {DateTime}
   */
  public settingMonth(month: number): DateTime {
    return new DateTime(setMonth(this.date, month));
  }

  /**
   * Sets the year.
   *
   * @param {number} year  Year.
   * @returns {DateTime}
   */
  public settingYear(year: number): DateTime {
    return new DateTime(setYear(this.date, year));
  }

  /**
   * Sets the hours.
   *
   * @param {number} hours  Hours (0–23).
   * @returns {DateTime}
   */
  public settingHours(hours: number): DateTime {
    return new DateTime(setHours(this.date, hours));
  }

  /**
   * Sets the minutes.
   *
   * @param {number} minutes  Minutes (0–59).
   * @returns {DateTime}
   */
  public settingMinutes(minutes: number): DateTime {
    return new DateTime(setMinutes(this.date, minutes));
  }

  /**
   * Sets the seconds.
   *
   * @param {number} seconds  Seconds (0–59).
   * @returns {DateTime}
   */
  public settingSeconds(seconds: number): DateTime {
    return new DateTime(setSeconds(this.date, seconds));
  }
}
