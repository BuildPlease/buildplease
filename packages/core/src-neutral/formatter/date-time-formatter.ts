import type { DateTimeFormatOptions } from '@neutral/formatter/date-time-format-options';
import { type DateTime, ZonedDateTime } from '@neutral/model';
import { injectable } from 'inversify';

export interface DateTimeFormatter {
  /**
   * Formats a temporal value for human-readable presentation.
   *
   * @remarks
   * `DateTime` is always formatted in UTC. `ZonedDateTime` is formatted in its
   * configured IANA time zone. Locale affects presentation only and never the
   * represented instant or time zone.
   *
   * When options are omitted, a medium date with short time is used.
   *
   * @param value
   * Temporal value to format.
   *
   * @param options
   * Optional locale and `Intl.DateTimeFormat` presentation options.
   */
  format(value: DateTime | ZonedDateTime, options?: DateTimeFormatOptions): string;
}

@injectable()
export class DateTimeFormatterImpl implements DateTimeFormatter {
  public format(value: DateTime | ZonedDateTime, options?: DateTimeFormatOptions): string {
    const { locale, ...formatOptions } = options ?? {};
    const timeZone = value instanceof ZonedDateTime ? value.timeZone : 'UTC';
    const resolvedOptions = Object.keys(formatOptions).length === 0 ? defaultOptions : formatOptions;

    return new Intl.DateTimeFormat(locale, {
      ...resolvedOptions,
      timeZone: timeZone,
    }).format(value.toDate());
  }
}

const defaultOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
} as const satisfies Intl.DateTimeFormatOptions;
