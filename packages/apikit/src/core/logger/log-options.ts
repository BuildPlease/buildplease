import type { LogFlag } from '#/logger';
import type { RequestMetadata } from '#/request';

export interface LogOptions {
  flag?: LogFlag;
  content?: object;
  error?: Error | unknown;
  metadata?: Partial<RequestMetadata>;
}
