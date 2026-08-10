import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

export interface BaseLoggerTransportOptions {
  readonly level?: Level;
}

export interface LoggerConsoleTransportOptions extends BaseLoggerTransportOptions {
  readonly type: 'console';
  readonly target: 'pino-pretty';
  readonly pretty?: PrettyOptions;
}

export interface LoggerFileTransportOptions extends BaseLoggerTransportOptions {
  readonly type: 'file';
  readonly path: string;
}

export type LoggerTransportOptions = LoggerConsoleTransportOptions | LoggerFileTransportOptions;

export type LoggerOptions =
  | {
      readonly enabled: false;
      readonly debug?: boolean;
      readonly transports?: never;
    }
  | {
      readonly enabled: true;
      readonly debug?: boolean;
      readonly transports: readonly [LoggerTransportOptions, ...LoggerTransportOptions[]];
    };
