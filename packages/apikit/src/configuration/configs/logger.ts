import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';
import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type NonEmptyArray<T> = readonly [T, ...T[]];

export interface BaseTransportOptions {
  readonly level?: Level;
}

export interface ConsoleTransportOptions extends BaseTransportOptions {
  readonly type: 'console';
  readonly target: 'pino-pretty';
  readonly pretty?: PrettyOptions;
}

export interface FileTransportOptions extends BaseTransportOptions {
  readonly type: 'file';
  readonly path: string;
}

export type TransportOptions = ConsoleTransportOptions | FileTransportOptions;

export type LoggerConfigurationValue =
  | {
      readonly enabled: false;
      readonly transports?: never;
    }
  | {
      readonly enabled: true;
      readonly transports: NonEmptyArray<TransportOptions>;
    };

export const LoggerConfiguration = defineConfiguration(
  field.custom<LoggerConfigurationValue>().default({
    enabled: ApiKitDefaults.logger.enabled,
  }),
);

export type LoggerConfig = InferConfiguration<typeof LoggerConfiguration>;
