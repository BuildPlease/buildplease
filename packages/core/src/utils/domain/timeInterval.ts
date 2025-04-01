import ms, { type StringValue } from 'ms';

/**
 * Represents a time interval in milliseconds, with helper methods for common time units.
 * Accepts intervals in string format (e.g., '2d', '10h') or number format (milliseconds).
 */
export class TimeInterval {
  private _milliseconds: number;

  constructor(interval: StringValue | number) {
    if (typeof interval === 'number') {
      this._milliseconds = interval;
    } else {
      const parsedMs = ms(interval);
      if (parsedMs === undefined) {
        throw new Error(`Invalid interval format: ${interval}`);
      }
      this._milliseconds = parsedMs;
    }
  }

  /** @returns The interval duration in milliseconds. */
  get milliseconds(): number {
    return this._milliseconds;
  }

  /** @returns The interval duration in seconds. */
  get seconds(): number {
    return Math.floor(this._milliseconds / 1000);
  }

  /** @returns The interval duration in minutes. */
  get minutes(): number {
    return Math.floor(this._milliseconds / (1000 * 60));
  }

  /** @returns The interval duration in hours. */
  get hours(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60));
  }

  /** @returns The interval duration in days. */
  get days(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60 * 24));
  }

  /** @returns The interval duration in weeks. */
  get weeks(): number {
    return Math.floor(this._milliseconds / (1000 * 60 * 60 * 24 * 7));
  }

  /** @returns Formatted interval string (e.g., '1h 30m'). */
  get formatted(): string {
    return ms(this._milliseconds);
  }

  /** @returns Verbose string representation (e.g., '1 hour 30 minutes'). */
  toString(): string {
    return ms(this._milliseconds, { long: true });
  }

  /** @returns Object with all time units for programmatic use. */
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
