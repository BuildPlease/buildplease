import type { LogFlag } from './log-flag';

export interface LogOptions {
  readonly flag?: LogFlag;
  readonly details?: unknown;
  readonly error?: unknown;
  readonly metadata?: unknown;
}
