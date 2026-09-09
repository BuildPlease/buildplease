import { tz, TZDate, tzOffset, tzScan } from '@date-fns/tz';
import { utc } from '@date-fns/utc';
import { DateTime } from '@neutral/model/date-time';
import { type FormatOptions, format as formatDate, isValid, parseISO } from 'date-fns';

const LOCAL_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSS";
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

/**
 * Represents an immutable UTC instant paired with an explicit IANA time zone.
 *
 * The instant is stored independently from its presentation time zone.
 * Changing the time zone preserves the instant and only changes its local
 * wall-clock representation.
 */
export class ZonedDateTime {
  private readonly dateTime: DateTime;

  /** IANA time-zone identifier used for local wall-clock representation. */
  public readonly timeZone: string;

  /**
   * Creates a timezone-aware date-time from an instant and IANA time zone.
   */
  public constructor(timeZone: string, utc?: Date | DateTime) {
    validateTimeZone(timeZone);

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
   * DST gaps and overlaps are rejected instead of being silently shifted
   * or disambiguated.
   */
  public static fromLocalIso(localIso: string, timeZone: string): ZonedDateTime {
    validateTimeZone(timeZone);

    if (hasExplicitOffset(localIso)) {
      throw new Error('Local date-time must not contain a UTC offset');
    }

    const local = parseISO(localIso, { in: utc });

    if (!isValid(local)) {
      throw new Error('Invalid local date-time string');
    }

    const wallClockMs = local.getTime();
    const startMs = wallClockMs - DAY_MS;
    const endMs = wallClockMs + DAY_MS;

    const offsets = new Set<number>([tzOffset(timeZone, local)]);

    for (const transition of tzScan(timeZone, {
      start: new Date(startMs),
      end: new Date(endMs),
    })) {
      const transitionMs = transition.date.getTime();

      if (transitionMs < startMs || transitionMs > endMs) continue;

      offsets.add(transition.offset);
      offsets.add(transition.offset - transition.change);
    }

    const expected = formatDate(local, LOCAL_PATTERN, { in: utc });

    const matches = [...offsets]
      .map((offset) => new Date(wallClockMs - offset * MINUTE_MS))
      .filter((instant) => formatDate(instant, LOCAL_PATTERN, { in: tz(timeZone) }) === expected);

    if (matches.length === 0) {
      throw new Error(`Local date-time does not exist in time zone: ${localIso} (${timeZone})`);
    }

    if (matches.length > 1) {
      throw new Error(`Local date-time is ambiguous in time zone: ${localIso} (${timeZone})`);
    }

    return ZonedDateTime.fromUtc(matches[0]!, timeZone);
  }

  /**
   * Formats this value in its configured time zone using a date-fns pattern.
   */
  public format(pattern: string, options?: FormatOptions): string {
    return formatDate(this.dateTime.toDate(), pattern, {
      ...options,
      in: tz(this.timeZone),
    });
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
   * Returns a defensive `Date` compatible value whose local getters operate
   * in this value's configured time zone.
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

    return tzOffset(this.timeZone, instant) * MINUTE_MS;
  }

  /** Returns the same instant represented in another IANA time zone. */
  public withTimeZone(timeZone: string): ZonedDateTime {
    return new ZonedDateTime(timeZone, this.dateTime);
  }
}

function validateTimeZone(timeZone: string): void {
  if (/^[+-]/u.test(timeZone) || Number.isNaN(tzOffset(timeZone, new Date(0)))) {
    throw new Error(`Invalid IANA time zone: ${timeZone}`);
  }
}

function hasExplicitOffset(value: string): boolean {
  return /[T ].*(?:Z|[+-]\d{2}(?::?\d{2})?)$/iu.test(value);
}
