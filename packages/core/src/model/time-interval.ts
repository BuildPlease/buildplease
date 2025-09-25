import ms, { type StringValue } from 'ms';

/**
 * Represents a time interval in milliseconds, with helper methods for common time units.
 *
 * @param interval
 *   A number (milliseconds), a string in ms format (e.g. "2d", "10h", "30m"),
 *   or null/undefined (throws at runtime).
 *
 * @param options
 *   Options passed directly to `ms()` when producing a string:
 *   • `{ long: true }` produces a verbose form (e.g. "1 hour 30 minutes").
 *
 * @throws {Error}
 *   If `interval` is null/undefined, or if a provided string cannot be parsed by `ms()`.
 *
 * @example
 * const t1 = new TimeInterval("2h");
 * console.log(t1.milliseconds); // 7200000
 * console.log(t1.hours);        // 2
 * console.log(t1.formatted);    // "2h"
 * console.log(t1.toString());   // "2h"
 *
 * @example
 * const t2 = new TimeInterval(15000, { long: true });
 * console.log(t2.seconds);      // 15
 * console.log(t2.toString());   // "15 seconds"
 *
 * @example
 * try {
 *   new TimeInterval("invalid");
 * } catch (err) {
 *   console.error(err.message); // "Invalid interval format: invalid"
 * }
 *
 * @example
 * try {
 *   new TimeInterval(null);
 * } catch (err) {
 *   console.error(err.message); // "Invalid interval format: null"
 * }
 */
export class TimeInterval {
  private readonly _milliseconds: number;
  private readonly _long: boolean;

  constructor(interval: string | number | null | undefined, options?: { long: boolean }) {
    this._long = options?.long === true;

    if (interval === null || interval === undefined) {
      throw new Error(`Invalid interval format: ${interval}`);
    }

    if (typeof interval === 'number') {
      this._milliseconds = interval;
    } else {
      const parsed = ms(interval as StringValue);
      if (parsed === undefined) {
        throw new Error(`Invalid interval format: ${interval}`);
      }
      this._milliseconds = parsed;
    }
  }

  /**
   * @returns The interval duration in milliseconds.
   */
  get milliseconds(): number {
    return this._milliseconds;
  }

  /**
   * @returns The interval duration in seconds.
   */
  get seconds(): number {
    return Math.floor(this._milliseconds / 1000);
  }

  /**
   * @returns The interval duration in minutes.
   */
  get minutes(): number {
    return Math.floor(this._milliseconds / (1000 * 60));
  }

  /**
   * @returns The interval duration in hours.
   */
  get hours(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60));
  }

  /**
   * @returns The interval duration in days.
   */
  get days(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60 * 24));
  }

  /**
   * @returns The interval duration in weeks.
   */
  get weeks(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60 * 24 * 7));
  }

  /**
   * @returns A compact, formatted string (e.g. "1h 30m", "45s").
   */
  get formatted(): string {
    return ms(this._milliseconds, { long: this._long });
  }

  /**
   * @returns A string representation of the interval.
   *   If `{ long: true }` was passed, returns a verbose form (e.g. "1 hour 30 minutes");
   *   otherwise, returns a compact form (e.g. "1h 30m").
   */
  toString(): string {
    return ms(this._milliseconds, { long: this._long });
  }

  /**
   * @returns An object with all time units for programmatic use.
   */
  toObject(): {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    weeks: number;
  } {
    return {
      milliseconds: this._milliseconds,
      seconds: this.seconds,
      minutes: this.minutes,
      hours: this.hours,
      days: this.days,
      weeks: this.weeks,
    };
  }
}
