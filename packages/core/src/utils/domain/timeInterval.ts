import ms from 'ms';

/**
 * Represents a time interval in milliseconds, using the `ms` library for parsing and formatting.
 * Accepts intervals in string format (e.g., '2d', '10h') or number format (milliseconds).
 */
export class TimeInterval {
  private _milliseconds: number;

  /**
   * Constructs a new `TimeInterval` instance.
   *
   * @param interval - Interval as a string (e.g., '1h', '30m') or number (milliseconds).
   * @throws {Error} If an invalid string format is provided.
   */
  constructor(interval: string | number) {
    if (typeof interval === 'string') {
      const parsedMs = ms(interval);
      if (parsedMs === undefined) {
        throw new Error(`Invalid interval format: ${interval}`);
      }
      this._milliseconds = parsedMs;
    } else {
      this._milliseconds = interval;
    }
  }

  /**
   * @returns The interval duration in milliseconds.
   */
  get milliseconds(): number {
    return this._milliseconds;
  }

  /**
   * @returns Formatted interval string.
   */
  get formatted(): string {
    return ms(this._milliseconds);
  }

  /**
   * @returns Verbose string representation of the interval.
   */
  toString(): string {
    return ms(this._milliseconds, { long: true });
  }
}
