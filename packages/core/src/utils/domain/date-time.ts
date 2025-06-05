export * from 'date-fns';

import {
  type Duration,
  type Locale,
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
 * - Instantiate with a `Date` or ISO-format string.
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
      if (!isValid(input)) throw new Error('DateTime: Invalid date object');
      this.date = input;
      return;
    }

    const parsed = parseISO(input);
    if (!isValid(parsed)) throw new Error('DateTime: Invalid date string');
    this.date = parsed;
  }

  // MARK: - Static Factory Methods

  /**
   * Creates a DateTime from a Date object.
   *
   * @param date
   *   A JavaScript Date instance.
   * @returns {DateTime | null}
   *   A new DateTime if valid; otherwise null.
   */
  public static fromDate(date: Date): DateTime | null {
    return isValid(date) ? new DateTime(date) : null;
  }

  /**
   * Parses a string into a DateTime instance.
   *
   * @param dateString
   *   The input date string (e.g. "2025-06-05T14:30:00Z" or "06/05/2025").
   * @param formatString
   *   An optional format to use for parsing (e.g. one of the `DateFormat` values
   *   or any custom string). If omitted, ISO parsing is applied.
   * @param referenceDate
   *   The reference date (defaults to now) when parsing non-ISO strings.
   * @returns
   *   A new `DateTime` if parsing succeeds; otherwise `null`.
   *
   * @example
   * ```ts
   * // Using a named enum format:
   * const dt1 = DateTime.fromString("06/05/2025", DateFormat.MM_DD_YYYY);
   *
   * // Using a raw format string:
   * const dt2 = DateTime.fromString("2025/06/05 14:30:00", "yyyy/MM/dd HH:mm:ss");
   *
   * // Omitted formatString: tries ISO parsing
   * const dt3 = DateTime.fromString("2025-06-05T14:30:00Z");
   * ```
   */
  public static fromString(
    dateString: string,
    formatString?: DateFormat | string,
    referenceDate: Date = new Date(),
  ): DateTime | null {
    const date = formatString
      ? parse(dateString, formatString, referenceDate)
      : parseISO(dateString);

    return isValid(date) ? new DateTime(date) : null;
  }

  /** @returns The current moment as a DateTime. */
  public static now(): DateTime {
    return new DateTime(new Date());
  }

  /**
   * Create a DateTime from a Unix timestamp (seconds).
   *
   * @param unixTimestamp
   *   The Unix timestamp in seconds.
   * @returns {DateTime}
   */
  public static fromUnixTimestamp(unixTimestamp: number): DateTime {
    return new DateTime(fromUnixTime(unixTimestamp));
  }

  // MARK: - Converters

  /** @returns The wrapped JavaScript Date. */
  public toDate(): Date {
    return this.date;
  }

  /** @returns The Unix timestamp in seconds. */
  public toUnixTimestamp(): number {
    return getUnixTime(this.date);
  }

  /** @returns An ISO‐8601 string. */
  public toISOString(): string {
    return formatISO(this.date);
  }

  /**
   * Formats this DateTime using the given pattern.
   *
   * @param pattern
   *   A format string (for example, one of the `DateFormat` values or
   *   any custom string).
   * @param options
   *   Optional `{ locale?: Locale }` for localized month/day names.
   * @returns
   *   The formatted date string.
   *
   * @example
   * ```ts
   * const dt = new DateTime('2025-06-05T14:30:00Z');
   * console.log(dt.format(DateFormat.ISO_DATETIME));  // "2025-06-05T14:30:00+00:00"
   * console.log(dt.format(DateFormat.MM_DD_YYYY));    // "06/05/2025"
   * console.log(dt.format(DateFormat.RSS));           // "Fri, 05 Jun 2025 14:30:00 +0000"
   * console.log(dt.format('yyyy/MM/dd HH:mm:ss'));    // "2025/06/05 14:30:00"
   * ```
   */
  public format(pattern: DateFormat | string, options?: { locale?: Locale }): string {
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
   * @param day  Day of the month (1–31).
   * @returns {DateTime}
   */
  public settingDayOfMonth(day: number): DateTime {
    return new DateTime(setDate(this.date, day));
  }

  /**
   * Sets the day of the week.
   *
   * @param day  Day of the week (0–6, 0 = Sunday).
   * @returns {DateTime}
   */
  public settingDayOfWeek(day: number): DateTime {
    return new DateTime(setDay(this.date, day));
  }

  /**
   * Sets the month.
   *
   * @param month  Month (0–11).
   * @returns {DateTime}
   */
  public settingMonth(month: number): DateTime {
    return new DateTime(setMonth(this.date, month));
  }

  /**
   * Sets the year.
   *
   * @param year  Year.
   * @returns {DateTime}
   */
  public settingYear(year: number): DateTime {
    return new DateTime(setYear(this.date, year));
  }

  /**
   * Sets the hours.
   *
   * @param hours  Hours (0–23).
   * @returns {DateTime}
   */
  public settingHours(hours: number): DateTime {
    return new DateTime(setHours(this.date, hours));
  }

  /**
   * Sets the minutes.
   *
   * @param minutes  Minutes (0–59).
   * @returns {DateTime}
   */
  public settingMinutes(minutes: number): DateTime {
    return new DateTime(setMinutes(this.date, minutes));
  }

  /**
   * Sets the seconds.
   *
   * @param seconds  Seconds (0–59).
   * @returns {DateTime}
   */
  public settingSeconds(seconds: number): DateTime {
    return new DateTime(setSeconds(this.date, seconds));
  }
}

export enum DateFormat {
  /** ISO date only (yyyy-MM-dd), e.g. "2025-06-05" */
  ISO_DATE = 'yyyy-MM-dd',

  /** ISO date + time with offset, e.g. "2025-06-05T13:24:00+00:00" */
  ISO_DATETIME = "yyyy-MM-dd'T'HH:mm:ssXXX",

  /** Month/day/year, e.g. "06/05/2025" */
  MM_DD_YYYY = 'MM/dd/yyyy',

  /** Full month name + day + year, e.g. "June 5, 2025" */
  FULL_MONTH_DAY_YEAR = 'MMMM d, yyyy',

  /** Abbreviated month + day + year, e.g. "Jun 5, 2025" */
  ABBR_MONTH_DAY_YEAR = 'MMM d, yyyy',

  /** RFC-3339 with milliseconds, e.g. "2025-06-05T13:24:00.000Z" */
  RFC_3339 = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",

  /** Alternative RSS date, e.g. "09 Sep 2011 15:26:08 +0200" */
  ALT_RSS = 'd MMM yyyy HH:mm:ss ZZZ',

  /** Standard RSS date, e.g. "Fri, 09 Sep 2011 15:26:08 +0200" */
  RSS = 'EEE, d MMM yyyy HH:mm:ss ZZZ',

  /** HTTP header date, e.g. "Tue, 15 Nov 1994 12:45:26 GMT" */
  HTTP_HEADER = 'EEE, dd MMM yyyy HH:mm:ss zzz',

  /** Generic standard format, e.g. "Fri Sep 09 15:26:08 +0000 2011" */
  STANDARD = 'EEE MMM dd HH:mm:ss Z yyyy',

  /** Extended format, e.g. "Fri 09-Sep-2011 AD 15:26:08.000 UTC" */
  EXTENDED = 'eee dd-MMM-yyyy GG HH:mm:ss.SSS zzz',
}
