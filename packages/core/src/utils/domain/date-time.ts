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
 * A versatile `DateTime` class for date and time manipulation, wrapping JavaScript's `Date` object and `date-fns` functions.
 * It offers a comprehensive set of methods and follows Swift-like conventions.
 *
 * ### Initialization:
 *
 * The `DateTime` class can be instantiated in several ways:
 *
 * - **No arguments (`new DateTime()`):**
 *   - Initializes to the current date and time.
 *
 * - **With a `Date` object (`new DateTime(date: Date)`):**
 *   - Initializes with the provided `Date` object.
 *   - Throws an error if the `Date` object is invalid.
 *
 * - **With a date string (`new DateTime(dateString: string)`):**
 *   - Parses the provided date string and initializes with the resulting date.
 *   - The date string should be in ISO 8601 format or a format recognized by `parseISO`.
 *   - Throws an error if the date string is invalid or cannot be parsed.
 *
 * **Examples:**
 *
 * ```typescript
 * // Initialize to the current date and time
 * const now = new DateTime();
 *
 * // Initialize with a valid Date object
 * const date = new Date('2022-12-12');
 * const dateTimeFromDate = new DateTime(date);
 *
 * // Initialize with a valid date string
 * const dateTimeFromString = new DateTime('2022-12-12');
 * ```
 *
 * **Note:**
 * The constructor expects valid inputs and does not accept `undefined` or `null`.
 * If there's a possibility of such values, ensure they are handled before instantiation.
 *
 * @throws Will throw an error if the provided `Date` object or date string is invalid.
 */

export class DateTime {
  private readonly date: Date;

  // MARK: - Constructors

  public constructor(date: Date);
  public constructor(dateString: string);

  public constructor(input: Date | string) {
    if (input instanceof Date) {
      this.date = input;
    } else if (typeof input === 'string') {
      const parsedDate = parseISO(input);
      if (isValid(parsedDate)) {
        this.date = parsedDate;
      } else {
        throw new Error('Invalid date string');
      }
    } else {
      throw new Error('Invalid input: expected a Date object or a date string');
    }
  }

  // MARK: - Static Factory Methods

  /**
   * Creates a DateTime instance from a Date object.
   * @param date - The Date object.
   * @returns A new DateTime instance or null if the date is invalid.
   */
  public static fromDate(date: Date): DateTime | null {
    return isValid(date) ? new DateTime(date) : null;
  }

  /**
   * Parses a date string and creates a DateTime instance.
   * @param dateString - The date string to parse.
   * @param formatString - Optional format string to parse non-ISO strings.
   * @param referenceDate - Optional reference date for parsing.
   * @returns A new DateTime instance or null if parsing fails.
   */
  public static fromString(
    dateString: string,
    formatString?: string,
    referenceDate: Date = new Date(),
  ): DateTime | null {
    let date: Date;
    if (formatString) {
      date = parse(dateString, formatString, referenceDate);
    } else {
      date = parseISO(dateString);
    }
    return isValid(date) ? new DateTime(date) : null;
  }

  /**
   * Creates a DateTime instance representing the current date and time.
   * @returns A new DateTime instance.
   */
  public static now(): DateTime {
    return new DateTime(new Date());
  }

  /**
   * Creates a DateTime instance from a Unix timestamp.
   * @param unixTimestamp - The Unix timestamp in seconds.
   * @returns A new DateTime instance.
   */
  public static fromUnixTimestamp(unixTimestamp: number): DateTime {
    const date = fromUnixTime(unixTimestamp);
    return new DateTime(date);
  }

  // MARK: - Instance Methods

  /**
   * Converts the DateTime instance to a JavaScript Date object.
   * @returns The Date object.
   */
  public toDate(): Date {
    return this.date;
  }

  /**
   * Converts the DateTime instance to a Unix timestamp.
   * @returns The Unix timestamp in seconds.
   */
  public toUnixTimestamp(): number {
    return getUnixTime(this.date);
  }

  /**
   * Converts the DateTime instance to an ISO 8601 string.
   * @returns The ISO 8601 string.
   */
  public toISOString(): string {
    return formatISO(this.date);
  }

  /**
   * Formats the DateTime instance using a specified pattern.
   * @param pattern - The format pattern.
   * @param options - Optional formatting options.
   * @returns The formatted date string.
   */
  public format(pattern: string, options?: { locale?: Locale }): string {
    return formatDate(this.date, pattern, options);
  }

  // MARK: - Adding Durations

  /**
   * Adds a duration to the DateTime instance.
   * @param duration - The duration to add.
   * @returns A new DateTime instance.
   */
  public addingDuration(duration: Duration): DateTime {
    const newDate = add(this.date, duration);
    return new DateTime(newDate);
  }

  /**
   * Adds milliseconds to the DateTime instance.
   * @param milliseconds - The number of milliseconds to add.
   * @returns A new DateTime instance.
   */
  public addingMilliseconds(milliseconds: number): DateTime {
    return new DateTime(addMilliseconds(this.date, milliseconds));
  }

  /**
   * Adds seconds to the DateTime instance.
   * @param seconds - The number of seconds to add.
   * @returns A new DateTime instance.
   */
  public addingSeconds(seconds: number): DateTime {
    return new DateTime(addSeconds(this.date, seconds));
  }

  /**
   * Adds minutes to the DateTime instance.
   * @param minutes - The number of minutes to add.
   * @returns A new DateTime instance.
   */
  public addingMinutes(minutes: number): DateTime {
    return new DateTime(addMinutes(this.date, minutes));
  }

  /**
   * Adds hours to the DateTime instance.
   * @param hours - The number of hours to add.
   * @returns A new DateTime instance.
   */
  public addingHours(hours: number): DateTime {
    return new DateTime(addHours(this.date, hours));
  }

  /**
   * Adds days to the DateTime instance.
   * @param days - The number of days to add.
   * @returns A new DateTime instance.
   */
  public addingDays(days: number): DateTime {
    return new DateTime(addDays(this.date, days));
  }

  /**
   * Adds weeks to the DateTime instance.
   * @param weeks - The number of weeks to add.
   * @returns A new DateTime instance.
   */
  public addingWeeks(weeks: number): DateTime {
    return new DateTime(addWeeks(this.date, weeks));
  }

  /**
   * Adds months to the DateTime instance.
   * @param months - The number of months to add.
   * @returns A new DateTime instance.
   */
  public addingMonths(months: number): DateTime {
    return new DateTime(addMonths(this.date, months));
  }

  /**
   * Adds years to the DateTime instance.
   * @param years - The number of years to add.
   * @returns A new DateTime instance.
   */
  public addingYears(years: number): DateTime {
    return new DateTime(addYears(this.date, years));
  }

  // MARK: - Subtracting Durations

  /**
   * Subtracts a duration from the DateTime instance.
   * @param duration - The duration to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingDuration(duration: Duration): DateTime {
    const newDate = sub(this.date, duration);
    return new DateTime(newDate);
  }

  /**
   * Subtracts milliseconds from the DateTime instance.
   * @param milliseconds - The number of milliseconds to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingMilliseconds(milliseconds: number): DateTime {
    return new DateTime(subMilliseconds(this.date, milliseconds));
  }

  /**
   * Subtracts seconds from the DateTime instance.
   * @param seconds - The number of seconds to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingSeconds(seconds: number): DateTime {
    return new DateTime(subSeconds(this.date, seconds));
  }

  /**
   * Subtracts minutes from the DateTime instance.
   * @param minutes - The number of minutes to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingMinutes(minutes: number): DateTime {
    return new DateTime(subMinutes(this.date, minutes));
  }

  /**
   * Subtracts hours from the DateTime instance.
   * @param hours - The number of hours to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingHours(hours: number): DateTime {
    return new DateTime(subHours(this.date, hours));
  }

  /**
   * Subtracts days from the DateTime instance.
   * @param days - The number of days to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingDays(days: number): DateTime {
    return new DateTime(subDays(this.date, days));
  }

  /**
   * Subtracts weeks from the DateTime instance.
   * @param weeks - The number of weeks to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingWeeks(weeks: number): DateTime {
    return new DateTime(subWeeks(this.date, weeks));
  }

  /**
   * Subtracts months from the DateTime instance.
   * @param months - The number of months to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingMonths(months: number): DateTime {
    return new DateTime(subMonths(this.date, months));
  }

  /**
   * Subtracts years from the DateTime instance.
   * @param years - The number of years to subtract.
   * @returns A new DateTime instance.
   */
  public subtractingYears(years: number): DateTime {
    return new DateTime(subYears(this.date, years));
  }

  // MARK: - Difference Methods

  /**
   * Calculates the difference between this DateTime and another in milliseconds.
   * @param other - The other DateTime instance.
   * @returns The difference in milliseconds.
   */
  public differenceInMilliseconds(other: DateTime): number {
    return differenceInMilliseconds(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in seconds.
   * @param other - The other DateTime instance.
   * @returns The difference in seconds.
   */
  public differenceInSeconds(other: DateTime): number {
    return differenceInSeconds(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in minutes.
   * @param other - The other DateTime instance.
   * @returns The difference in minutes.
   */
  public differenceInMinutes(other: DateTime): number {
    return differenceInMinutes(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in hours.
   * @param other - The other DateTime instance.
   * @returns The difference in hours.
   */
  public differenceInHours(other: DateTime): number {
    return differenceInHours(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in days.
   * @param other - The other DateTime instance.
   * @returns The difference in days.
   */
  public differenceInDays(other: DateTime): number {
    return differenceInDays(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in weeks.
   * @param other - The other DateTime instance.
   * @returns The difference in weeks.
   */
  public differenceInWeeks(other: DateTime): number {
    return differenceInWeeks(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in months.
   * @param other - The other DateTime instance.
   * @returns The difference in months.
   */
  public differenceInMonths(other: DateTime): number {
    return differenceInMonths(this.date, other.date);
  }

  /**
   * Calculates the difference between this DateTime and another in years.
   * @param other - The other DateTime instance.
   * @returns The difference in years.
   */
  public differenceInYears(other: DateTime): number {
    return differenceInYears(this.date, other.date);
  }

  // MARK: - Comparison Methods

  /**
   * Checks if this DateTime is equal to another.
   * @param other - The other DateTime instance.
   * @returns True if equal, false otherwise.
   */
  public isEqualTo(other: DateTime): boolean {
    return isEqual(this.date, other.date);
  }

  /**
   * Checks if this DateTime is before another.
   * @param other - The other DateTime instance.
   * @returns True if before, false otherwise.
   */
  public isBefore(other: DateTime): boolean {
    return isBefore(this.date, other.date);
  }

  /**
   * Checks if this DateTime is after another.
   * @param other - The other DateTime instance.
   * @returns True if after, false otherwise.
   */
  public isAfter(other: DateTime): boolean {
    return isAfter(this.date, other.date);
  }

  /**
   * Compares this DateTime to another.
   * @param other - The other DateTime instance.
   * @returns -1 if before, 0 if equal, 1 if after.
   */
  public compareTo(other: DateTime): number {
    return compareAsc(this.date, other.date);
  }

  /**
   * Checks if this DateTime is on the same day as another.
   * @param other - The other DateTime instance.
   * @returns True if on the same day, false otherwise.
   */
  public isSameDayAs(other: DateTime): boolean {
    return isSameDay(this.date, other.date);
  }

  // MARK: - Start and End of Intervals

  /**
   * Gets the start of the day for this DateTime.
   * @returns A new DateTime instance at the start of the day.
   */
  public startOfDay(): DateTime {
    return new DateTime(startOfDay(this.date));
  }

  /**
   * Gets the end of the day for this DateTime.
   * @returns A new DateTime instance at the end of the day.
   */
  public endOfDay(): DateTime {
    return new DateTime(endOfDay(this.date));
  }

  /**
   * Gets the start of the week for this DateTime.
   * @returns A new DateTime instance at the start of the week.
   */
  public startOfWeek(): DateTime {
    return new DateTime(startOfWeek(this.date));
  }

  /**
   * Gets the end of the week for this DateTime.
   * @returns A new DateTime instance at the end of the week.
   */
  public endOfWeek(): DateTime {
    return new DateTime(endOfWeek(this.date));
  }

  /**
   * Gets the start of the month for this DateTime.
   * @returns A new DateTime instance at the start of the month.
   */
  public startOfMonth(): DateTime {
    return new DateTime(startOfMonth(this.date));
  }

  /**
   * Gets the end of the month for this DateTime.
   * @returns A new DateTime instance at the end of the month.
   */
  public endOfMonth(): DateTime {
    return new DateTime(endOfMonth(this.date));
  }

  /**
   * Gets the start of the year for this DateTime.
   * @returns A new DateTime instance at the start of the year.
   */
  public startOfYear(): DateTime {
    return new DateTime(startOfYear(this.date));
  }

  /**
   * Gets the end of the year for this DateTime.
   * @returns A new DateTime instance at the end of the year.
   */
  public endOfYear(): DateTime {
    return new DateTime(endOfYear(this.date));
  }

  // MARK: - Getters

  /**
   * Gets the day of the month (1-31).
   */
  public get dayOfMonth(): number {
    return getDate(this.date);
  }

  /**
   * Gets the day of the week (0-6, where 0 represents Sunday).
   */
  public get dayOfWeek(): number {
    return getDay(this.date);
  }

  /**
   * Gets the month (0-11).
   */
  public get month(): number {
    return getMonth(this.date);
  }

  /**
   * Gets the year.
   */
  public get year(): number {
    return getYear(this.date);
  }

  /**
   * Gets the hours (0-23).
   */
  public get hours(): number {
    return getHours(this.date);
  }

  /**
   * Gets the minutes (0-59).
   */
  public get minutes(): number {
    return getMinutes(this.date);
  }

  /**
   * Gets the seconds (0-59).
   */
  public get seconds(): number {
    return getSeconds(this.date);
  }

  // MARK: - Setters (Immutable)

  /**
   * Sets the day of the month.
   * @param day - The day of the month (1-31).
   * @returns A new DateTime instance.
   */
  public settingDayOfMonth(day: number): DateTime {
    return new DateTime(setDate(this.date, day));
  }

  /**
   * Sets the day of the week.
   * @param day - The day of the week (0-6, where 0 represents Sunday).
   * @returns A new DateTime instance.
   */
  public settingDayOfWeek(day: number): DateTime {
    return new DateTime(setDay(this.date, day));
  }

  /**
   * Sets the month.
   * @param month - The month (0-11).
   * @returns A new DateTime instance.
   */
  public settingMonth(month: number): DateTime {
    return new DateTime(setMonth(this.date, month));
  }

  /**
   * Sets the year.
   * @param year - The year.
   * @returns A new DateTime instance.
   */
  public settingYear(year: number): DateTime {
    return new DateTime(setYear(this.date, year));
  }

  /**
   * Sets the hours.
   * @param hours - The hours (0-23).
   * @returns A new DateTime instance.
   */
  public settingHours(hours: number): DateTime {
    return new DateTime(setHours(this.date, hours));
  }

  /**
   * Sets the minutes.
   * @param minutes - The minutes (0-59).
   * @returns A new DateTime instance.
   */
  public settingMinutes(minutes: number): DateTime {
    return new DateTime(setMinutes(this.date, minutes));
  }

  /**
   * Sets the seconds.
   * @param seconds - The seconds (0-59).
   * @returns A new DateTime instance.
   */
  public settingSeconds(seconds: number): DateTime {
    return new DateTime(setSeconds(this.date, seconds));
  }
}
