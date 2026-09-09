import { tz, TZDate, tzOffset } from '@date-fns/tz';
import { DateTime } from '@neutral/model/date-time';
import { type FormatOptions, format as formatDate, isValid, parseISO } from 'date-fns';

/**
 * Represents an immutable UTC instant paired with an explicit IANA time zone.
 *
 * @remarks
 * The instant is stored independently from its presentation time zone. Changing
 * the time zone preserves the instant and only changes its local wall-clock
 * representation. Numeric UTC offsets are not accepted as time-zone identity.
 *
 * @example
 * const eventTime = ZonedDateTime.fromUtc(
 *   new DateTime('2026-09-09T16:00:00Z'),
 *   'Europe/Bratislava',
 * );
 * eventTime.toLocalIsoMinutes();
 * // "2026-09-09T18:00"
 *
 * @throws {Error}
 * When the time zone is not a valid IANA time-zone identifier.
 */
export class ZonedDateTime {
  private readonly dateTime: DateTime;

  /** IANA time-zone identifier used for local wall-clock representation. */
  public readonly timeZone: string;

  /**
   * Creates a timezone-aware date-time from an instant and IANA time zone.
   *
   * @param timeZone
   * IANA time-zone identifier, for example `Europe/Bratislava`.
   *
   * @param utc
   * UTC instant. Omit to use the current instant.
   */
  public constructor(timeZone: string, utc?: Date | DateTime) {
    assertIanaTimeZone(timeZone);

    this.timeZone = timeZone;
    this.dateTime = utc instanceof DateTime ? utc : new DateTime(utc);
  }

  /** Returns a defensive native `Date` copy of the UTC instant. */
  public get utc(): Date {
    return this.dateTime.toDate();
  }

  /** Creates a timezone-aware value from a known UTC instant. */
  public static fromUtc(utc: Date | DateTime, timeZone: string): ZonedDateTime {
    return new ZonedDateTime(timeZone, utc);
  }

  /**
   * Creates a timezone-aware value from a local wall-clock ISO date-time.
   *
   * @remarks
   * `localIso` is interpreted in `timeZone` and must not contain a `Z` suffix or
   * numeric UTC offset. Daylight-saving rules are resolved by the IANA time zone.
   *
   * @example
   * ZonedDateTime.fromLocalIso('2026-07-15T18:00', 'Europe/Bratislava')
   *   .toISOString();
   * // "2026-07-15T16:00:00.000Z"
   *
   * @throws {Error}
   * When `localIso` is invalid or contains its own UTC offset.
   */
  public static fromLocalIso(localIso: string, timeZone: string): ZonedDateTime {
    assertIanaTimeZone(timeZone);

    if (hasExplicitOffset(localIso)) {
      throw new Error('Local date-time must not contain a UTC offset');
    }

    const parsed = parseISO(localIso, { in: tz(timeZone) });
    if (!isValid(parsed)) throw new Error('Invalid local date-time string');

    return new ZonedDateTime(timeZone, new DateTime(parsed));
  }

  /**
   * Formats this value in its configured time zone using a date-fns pattern.
   *
   * @remarks
   * Prefer the `DateTimeFormatter` for human-readable application
   * output. This method remains for pattern-based compatibility.
   */
  public format(pattern: string, options?: FormatOptions): string {
    return formatDate(this.dateTime.toDate(), pattern, { ...options, in: tz(this.timeZone) });
  }

  /** Returns a local ISO string without offset at minute precision. */
  public toLocalIsoMinutes(options?: FormatOptions): string {
    return this.format("yyyy-MM-dd'T'HH:mm", options);
  }

  /** Returns a local ISO string without offset at second precision. */
  public toLocalIsoSeconds(options?: FormatOptions): string {
    return this.format("yyyy-MM-dd'T'HH:mm:ss", options);
  }

  /** Returns the UTC instant as a canonical ISO-8601 string using `Z`. */
  public toISOString(): string {
    return this.dateTime.toISOString();
  }

  /** Returns a defensive native `Date` copy representing the same instant. */
  public toDate(): Date {
    return this.dateTime.toDate();
  }

  /** Returns the Unix timestamp in seconds. */
  public toUnixTimestamp(): number {
    return this.dateTime.toUnixTimestamp();
  }

  /**
   * Returns a defensive `Date` compatible value whose local getters operate in
   * this value's configured time zone.
   *
   * @remarks
   * The returned object is independent from this `ZonedDateTime`; mutating it
   * cannot change the stored instant.
   */
  public toZonedDate(): Date {
    return new TZDate(this.dateTime.getTime(), this.timeZone);
  }

  /**
   * Returns the configured time-zone offset from UTC in milliseconds at an
   * instant. Positive values are east of UTC.
   */
  public timezoneOffsetMs(atUtc?: Date | DateTime): number {
    const instant = atUtc instanceof DateTime ? atUtc.toDate() : (atUtc ?? this.dateTime.toDate());
    return tzOffset(this.timeZone, instant) * 60_000;
  }

  /** Returns the same instant represented in another IANA time zone. */
  public withTimeZone(timeZone: string): ZonedDateTime {
    return new ZonedDateTime(timeZone, this.dateTime);
  }
}

function assertIanaTimeZone(timeZone: string): void {
  if (timeZone.length === 0 || /^[+-]/u.test(timeZone)) {
    throw new Error(`Invalid IANA time zone: ${timeZone}`);
  }

  try {
    new Intl.DateTimeFormat('en', { timeZone: timeZone }).format(0);
  } catch {
    throw new Error(`Invalid IANA time zone: ${timeZone}`);
  }
}

function hasExplicitOffset(value: string): boolean {
  const separatorIndex = value.search(/[T ]/u);
  if (separatorIndex < 0) return false;

  return /(?:Z|[+-]\d{2}(?::?\d{2})?)$/iu.test(value.slice(separatorIndex + 1));
}
