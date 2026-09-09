import type { TimeInterval } from '@neutral/model';
import { injectable } from 'inversify';

export type TimeIntervalFormatOptions = Omit<Intl.NumberFormatOptions, 'style' | 'unit'> & {
  /** Locale used for human-readable presentation. */
  locale?: string | string[];
};

export interface TimeIntervalFormatter {
  /**
   * Formats a time interval using the largest suitable localized unit.
   *
   * @remarks
   * Locale affects presentation only. The represented interval is never
   * rounded or otherwise changed before it is passed to `Intl.NumberFormat`.
   *
   * @param value
   * Time interval to format.
   *
   * @param options
   * Optional locale and `Intl.NumberFormat` presentation options. Unit style
   * and the selected unit are owned by the formatter.
   */
  format(value: TimeInterval, options?: TimeIntervalFormatOptions): string;
}

@injectable()
export class TimeIntervalFormatterImpl implements TimeIntervalFormatter {
  public format(value: TimeInterval, options?: TimeIntervalFormatOptions): string {
    const { locale, ...formatOptions } = options ?? {};
    const milliseconds = value.milliseconds;
    const absoluteMilliseconds = Math.abs(milliseconds);

    let divisor = MILLISECONDS_PER_SECOND;
    let unit: Intl.NumberFormatOptions['unit'] = 'second';

    if (absoluteMilliseconds >= MILLISECONDS_PER_WEEK) {
      divisor = MILLISECONDS_PER_WEEK;
      unit = 'week';
    } else if (absoluteMilliseconds >= MILLISECONDS_PER_DAY) {
      divisor = MILLISECONDS_PER_DAY;
      unit = 'day';
    } else if (absoluteMilliseconds >= MILLISECONDS_PER_HOUR) {
      divisor = MILLISECONDS_PER_HOUR;
      unit = 'hour';
    } else if (absoluteMilliseconds >= MILLISECONDS_PER_MINUTE) {
      divisor = MILLISECONDS_PER_MINUTE;
      unit = 'minute';
    }

    return new Intl.NumberFormat(locale, {
      unitDisplay: 'long',
      ...formatOptions,
      style: 'unit',
      unit: unit,
    }).format(milliseconds / divisor);
  }
}

const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_MINUTE = 60 * MILLISECONDS_PER_SECOND;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
const MILLISECONDS_PER_WEEK = 7 * MILLISECONDS_PER_DAY;
