import { ApiKitAppDefaults } from '@internal/configuration/app';
import type { LoggerTransportOptions } from '@meawkit/core/node';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export interface LoggerRequestOptions {
  /**
   * @description Additional request paths skipped by the ApiKit request logger.
   *
   * ApiKit skips enabled internal endpoints automatically:
   * - `health.url`
   * - `metrics.endpoint`
   *
   * Matching is path-based and ignores query strings.
   *
   * @default []
   *
   * @example
   * ```ts
   * logger: {
   *   enabled: true,
   *   transports: [{ type: 'file', path: from.env('LOGGER_PATH') }],
   *   request: {
   *     ignoredPaths: ['/internal/ping'],
   *   },
   * }
   * ```
   */
  readonly ignoredPaths?: readonly string[];
}

export type LoggerConfigurationValue =
  | {
      readonly enabled: false;
      readonly transports?: never;
      readonly request?: never;
    }
  | {
      readonly enabled: true;
      readonly transports: readonly [LoggerTransportOptions, ...LoggerTransportOptions[]];
      readonly request?: LoggerRequestOptions;
    };

export const LoggerConfiguration = defineConfiguration(
  'apikit.logger',
  field
    .custom<LoggerConfigurationValue>()
    .default({
      enabled: ApiKitAppDefaults.logger.enabled,
    })
    .map(resolveLoggerConfiguration),
);

export type LoggerConfig = InferConfiguration<typeof LoggerConfiguration>;

function resolveLoggerConfiguration(input: LoggerConfigurationValue): LoggerConfigurationValue {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('apikit.logger must be object.');
  }

  if (typeof input.enabled !== 'boolean') {
    throw new Error('apikit.logger.enabled must be boolean.');
  }

  if (!input.enabled) {
    if ('transports' in input && input.transports !== undefined) {
      throw new Error('apikit.logger.transports cannot be configured when logger is disabled.');
    }

    if ('request' in input && input.request !== undefined) {
      throw new Error('apikit.logger.request cannot be configured when logger is disabled.');
    }

    return { enabled: false };
  }

  if (!Array.isArray(input.transports) || input.transports.length === 0) {
    throw new Error('apikit.logger.transports must be a non-empty array when logger is enabled.');
  }

  const request = resolveLoggerRequestOptions(input.request);

  return {
    enabled: true,
    transports: input.transports,
    ...(request ? { request: request } : {}),
  };
}

function resolveLoggerRequestOptions(input: LoggerRequestOptions | undefined): LoggerRequestOptions | undefined {
  if (input === undefined) return undefined;

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('apikit.logger.request must be object.');
  }

  if (input.ignoredPaths === undefined) return {};

  if (!Array.isArray(input.ignoredPaths)) {
    throw new Error('apikit.logger.request.ignoredPaths must be array.');
  }

  return {
    ignoredPaths: input.ignoredPaths.map((path, index) => validateIgnoredPath(path, index)),
  };
}

function validateIgnoredPath(path: string, index: number): string {
  if (typeof path !== 'string') {
    throw new Error(`apikit.logger.request.ignoredPaths[${index}] must be string.`);
  }

  const trimmedPath = path.trim();

  if (!trimmedPath) {
    throw new Error(`apikit.logger.request.ignoredPaths[${index}] must not be empty.`);
  }

  if (!trimmedPath.startsWith('/')) {
    throw new Error(`apikit.logger.request.ignoredPaths[${index}] must start with slash.`);
  }

  if (trimmedPath === '/') {
    throw new Error(`apikit.logger.request.ignoredPaths[${index}] must not be root path.`);
  }

  if (trimmedPath.includes('?') || trimmedPath.includes('#')) {
    throw new Error(`apikit.logger.request.ignoredPaths[${index}] must not contain query string or fragment.`);
  }

  return trimmedPath.length > 1 ? trimmedPath.replace(/\/+$/, '') : trimmedPath;
}
