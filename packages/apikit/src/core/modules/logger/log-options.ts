import type { LogFlag } from '$/logger';
import type { HttpMetadata } from '$/http';

export interface LogOptions {
  flag?: LogFlag;
  content?: object;
  error?: Error | unknown;
  metadata?: Partial<HttpMetadata>;
}
