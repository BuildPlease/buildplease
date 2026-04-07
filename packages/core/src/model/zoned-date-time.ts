import { formatInTimeZone, fromZonedTime, getTimezoneOffset, toZonedTime } from 'date-fns-tz';

import type { FormatOptionsWithTZ } from 'date-fns-tz';

/**
 * A UTC instant paired with an IANA time zone for formatting and conversions.
 *
 * @example
 * const zoned = ZonedDateTime.fromUtc(new Date(), 'Europe/Bratislava')
 * zoned.toLocalIsoMinutes()
 */
export class ZonedDateTime {
  /**
   * UTC instant (truth).
   *
   * @default new Date()
   * @output Date
   */
  public readonly utc: Date;

  /**
   * IANA time zone identifier.
   *
   * @output string
   * @example "Europe/Bratislava"
   */
  public readonly timeZone: string;

  /**
   * @input timeZone IANA time zone identifier.
   * @input utc UTC instant. Defaults to `new Date()`.
   * @output ZonedDateTime
   * @example new ZonedDateTime('Europe/Bratislava', new Date('2025-12-31T23:30:00.000Z'))
   */
  public constructor(timeZone: string, utc?: Date) {
    this.timeZone = timeZone;
    this.utc = utc ?? new Date();
  }

  /**
   * Create from a UTC instant.
   *
   * @input utc UTC instant.
   * @input timeZone IANA time zone identifier.
   * @output ZonedDateTime
   * @example ZonedDateTime.fromUtc(new Date('2025-12-31T23:30:00.000Z'), 'Europe/Bratislava')
   */
  public static fromUtc(utc: Date, timeZone: string): ZonedDateTime {
    return new ZonedDateTime(timeZone, utc);
  }

  /**
   * Create from a local wall-clock time interpreted in the provided time zone.
   *
   * @input localIso Local date-time without offset: "YYYY-MM-DDTHH:mm" (or with seconds).
   * @input timeZone IANA time zone identifier.
   * @output ZonedDateTime
   * @example ZonedDateTime.fromLocalIso('2026-01-01T18:00', 'Europe/Bratislava').toISOString()
   */
  public static fromLocalIso(localIso: string, timeZone: string): ZonedDateTime {
    const utcDate = fromZonedTime(localIso, timeZone);
    return new ZonedDateTime(timeZone, utcDate);
  }

  /**
   * Format this instant in the configured time zone.
   *
   * @input pattern date-fns format pattern.
   * @input options date-fns-tz format options (locale, weekStartsOn, etc).
   * @output string
   * @example zoned.format("yyyy-MM-dd'T'HH:mm")
   */
  public format(pattern: string, options?: FormatOptionsWithTZ): string {
    return formatInTimeZone(this.utc, this.timeZone, pattern, options);
  }

  /**
   * Local ISO string without offset, minute precision.
   *
   * @output string
   * @example zoned.toLocalIsoMinutes()
   */
  public toLocalIsoMinutes(options?: FormatOptionsWithTZ): string {
    return this.format("yyyy-MM-dd'T'HH:mm", options);
  }

  /**
   * Local ISO string without offset, second precision.
   *
   * @output string
   * @example zoned.toLocalIsoSeconds()
   */
  public toLocalIsoSeconds(options?: FormatOptionsWithTZ): string {
    return this.format("yyyy-MM-dd'T'HH:mm:ss", options);
  }

  /**
   * UTC ISO string (always Z).
   *
   * @output string
   * @example zoned.toISOString()
   */
  public toISOString(): string {
    return this.utc.toISOString();
  }

  /**
   * Unix timestamp in seconds.
   *
   * @output number
   * @example zoned.toUnixTimestamp()
   */
  public toUnixTimestamp(): number {
    return Math.floor(this.utc.getTime() / 1000);
  }

  /**
   * Date that formats to the local time of `timeZone` (useful for date pickers).
   *
   * @output Date
   * @example const pickerDate = zoned.toZonedDate()
   */
  public toZonedDate(): Date {
    return toZonedTime(this.utc, this.timeZone);
  }

  /**
   * Offset in milliseconds between the configured time zone and UTC at the given instant.
   *
   * @input atUtc UTC instant to evaluate offset at. Defaults to this.utc.
   * @output number
   * @example zoned.timezoneOffsetMs()
   */
  public timezoneOffsetMs(atUtc?: Date): number {
    return getTimezoneOffset(this.timeZone, atUtc ?? this.utc);
  }
}
