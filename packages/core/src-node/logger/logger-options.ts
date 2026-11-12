import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

export interface BaseLoggerTransportOptions {
  readonly level?: Level;
}

export interface LoggerPrettyStdoutTransportOptions extends BaseLoggerTransportOptions {
  readonly type: 'stdout';
  readonly format: 'pretty';
  readonly pretty?: PrettyOptions;
}

export interface LoggerJsonStdoutTransportOptions extends BaseLoggerTransportOptions {
  readonly type: 'stdout';
  readonly format: 'json';
}

export interface LoggerFileTransportOptions extends BaseLoggerTransportOptions {
  readonly type: 'file';
  readonly path: string;
}

export type LoggerStdoutTransportOptions = LoggerPrettyStdoutTransportOptions | LoggerJsonStdoutTransportOptions;

export type LoggerTransportOptions = LoggerStdoutTransportOptions | LoggerFileTransportOptions;

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
