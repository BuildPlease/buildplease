import type { LogFlag } from '#/logger';
import type { RequestMetadata } from '#/request';

export interface LogOptions {
  flag?: LogFlag;
  details?: object;
  error?: Error | unknown;
  metadata?: Partial<RequestMetadata>;
}
