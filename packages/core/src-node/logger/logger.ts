import path from 'node:path';

import { ensureDirectory, resolvePath } from '@node/file';
import pino, {
  type Bindings,
  type Level,
  type Logger as PinoLogger,
  type LoggerOptions as PinoLoggerOptions,
} from 'pino';

import { filterObject, isEmptyObject, isError, isObject, isPrimitive } from '@/utils';

import type { LogOptions } from './log-options';
import type {
  LoggerConsoleTransportOptions,
  LoggerFileTransportOptions,
  LoggerOptions,
  LoggerTransportOptions,
} from './logger-options';

const FILTER_OPTIONS = {
  filterNull: true,
  filterUndefined: true,
  filterEmptyString: true,
  filterEmptyArray: true,
  filterEmptyObject: true,
} as const;

export interface Logger {
  readonly instance: PinoLogger;

  info(title: string, options?: LogOptions): void;
  debug(title: string, options?: LogOptions): void;
  trace(title: string, options?: LogOptions): void;
  warn(title: string, options?: LogOptions): void;
  error(title: string, options?: LogOptions): void;
  fatal(title: string, options?: LogOptions): void;

  child(bindings: Bindings): PinoLogger;
}

export class LoggerImpl implements Logger {
  public readonly instance: PinoLogger;

  public constructor(private readonly options: LoggerOptions) {
    this.instance = this.makeInstance();
  }

  public info(title: string, options?: LogOptions): void {
    this.log('info', title, options);
  }

  public debug(title: string, options?: LogOptions): void {
    this.log('debug', title, options);
  }

  public trace(title: string, options?: LogOptions): void {
    this.log('trace', title, options);
  }

  public warn(title: string, options?: LogOptions): void {
    this.log('warn', title, options);
  }

  public error(title: string, options?: LogOptions): void {
    this.log('error', title, options);
  }

  public fatal(title: string, options?: LogOptions): void {
    this.log('fatal', title, options);
  }

  public child(bindings: Bindings): PinoLogger {
    return this.instance.child(bindings);
  }

  private log(level: Level, title: string, options?: LogOptions): void {
    this.instance[level]({
      msg: title,
      ...this.formatLogOptions(options),
    });
  }

  private formatLogOptions(options?: LogOptions): Record<string, unknown> {
    if (!options) return {};

    const formatted = filterObject(
      {
        flag: options.flag,
        details: this.formatUnknown(options.details),
        error: this.formatUnknown(options.error),
        metadata: this.formatUnknown(options.metadata),
      },
      FILTER_OPTIONS,
    );

    return formatted as Record<string, unknown>;
  }

  private formatUnknown(value: unknown): unknown {
    if (isError(value)) {
      const base: Record<string, unknown> = {
        type: value.constructor.name,
        message: value.message,
      };

      if (this.options.debug && value.stack) {
        base.stack = value.stack;
      }

      for (const key of Object.keys(value)) {
        if (!(key in base)) {
          base[key] = (value as unknown as Record<string, unknown>)[key];
        }
      }

      const filtered = filterObject(base, FILTER_OPTIONS);
      return isEmptyObject(filtered) ? undefined : filtered;
    }

    if (Buffer.isBuffer(value)) return '[Buffer]';
    if (value && typeof (value as { readonly pipe?: unknown }).pipe === 'function') return '[Stream]';

    if (isObject(value)) {
      try {
        const json = JSON.stringify(value);
        if (json === undefined) return undefined;

        const serialized = JSON.parse(json) as unknown;

        if (Array.isArray(serialized)) {
          return serialized.length > 0 ? serialized : undefined;
        }

        if (isObject(serialized)) {
          const filtered = filterObject(serialized, FILTER_OPTIONS);
          return isEmptyObject(filtered) ? undefined : filtered;
        }

        return serialized;
      } catch {
        return { type: 'NonSerializableObject' };
      }
    }

    if (isPrimitive(value)) return value;

    return String(value);
  }

  private makeInstance(): PinoLogger {
    if (!this.options.enabled) {
      return pino({
        enabled: false,
        timestamp: true,
      });
    }

    const transports = this.options.transports;
    const level = this.makeGlobalLogLevel(transports);

    const options: PinoLoggerOptions = {
      level: level,
      enabled: true,
      timestamp: true,
      transport: {
        targets: this.makeTransportTargets(transports),
      },
    };

    return pino(options);
  }

  private makeTransportTargets(input: readonly LoggerTransportOptions[]): pino.TransportTargetOptions[] {
    if (input.filter((transport) => transport.type === 'console').length > 1) {
      throw new Error('[Logger] Multiple console transports are not supported.');
    }

    return input.map((transportConfig) => {
      switch (transportConfig.type) {
        case 'console':
          return this.makeConsoleTransportTarget(transportConfig);

        case 'file':
          return this.makeFileTransportTarget(transportConfig);
      }
    });
  }

  private makeConsoleTransportTarget(config: LoggerConsoleTransportOptions): pino.TransportTargetOptions {
    const level = this.makeTransportLevel(config.level);

    return {
      target: 'pino-pretty',
      level: level,
      options: config.pretty,
    };
  }

  private makeFileTransportTarget(config: LoggerFileTransportOptions): pino.TransportTargetOptions {
    const level = this.makeTransportLevel(config.level);
    const destination = path.isAbsolute(config.path)
      ? path.normalize(config.path)
      : resolvePath(process.cwd(), config.path);

    ensureDirectory(path.dirname(destination));

    return {
      target: 'pino/file',
      level: level,
      options: { destination: destination },
    };
  }

  private makeTransportLevel(requested?: Level): Level {
    if (this.options.debug) return 'trace';
    return requested ?? 'info';
  }

  private makeGlobalLogLevel(transports: readonly LoggerTransportOptions[]): Level {
    if (this.options.debug) return 'trace';

    const firstTransport = transports.at(0);
    const fallbackLevel: Level = 'info';
    if (!firstTransport) return fallbackLevel;

    const weights = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5,
    } satisfies Record<Level, number>;

    let lowest = this.makeTransportLevel(firstTransport.level);

    for (const transport of transports.slice(1)) {
      const effective = this.makeTransportLevel(transport.level);
      if (weights[effective] < weights[lowest]) lowest = effective;
    }

    return lowest;
  }
}
