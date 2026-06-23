import path from 'node:path';

import { filterObject, isEmptyObject, isError, isObject, isPrimitive } from '@meawkit/core';
import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import { inject, injectable } from 'inversify';
import pino, { type Bindings, type Level, type Logger, type LoggerOptions } from 'pino';

import type {
  ApiKitController,
  ConsoleTransportOptions,
  FileTransportOptions,
  TransportOptions,
} from '@/configuration';
import { ApiKitSymbols } from '@/di';
import type { LogOptions } from '@/logger';
import type { RequestMetadata } from '@/request';

export interface LoggerController {
  get instance(): Logger;
  info(title: string, options?: LogOptions): void;
  debug(title: string, options?: LogOptions): void;
  trace(title: string, options?: LogOptions): void;
  warn(title: string, options?: LogOptions): void;
  error(title: string, options?: LogOptions): void;
  fatal(title: string, options?: LogOptions): void;
  child(bindings: Bindings): Logger;
}

@injectable()
export class LoggerControllerImpl implements LoggerController {
  public readonly instance: Logger;

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
  ) {
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

  public child(bindings: Bindings): Logger {
    return this.instance.child(bindings);
  }

  private log(level: pino.Level, title: string, options?: LogOptions): void {
    const logData: Record<string, unknown> = {};

    if (options?.flag) logData.flag = options.flag;
    if (options?.details) logData.details = this.formatDetails(options.details);
    if (options?.error) logData.error = this.formatError(options.error);

    if (options?.metadata) {
      const formatted = this.formatMetadata(options.metadata);
      if (formatted) logData.metadata = formatted;
    }

    this.instance[level]({ msg: title, ...logData });
  }

  private formatError(error: unknown): unknown {
    return this.formatUnknown(error);
  }

  private formatDetails(details: unknown): unknown {
    return this.formatUnknown(details);
  }

  private formatMetadata(metadata: Partial<RequestMetadata>): object | undefined {
    const selectedHeaders = {
      'user-agent': metadata.headers?.['user-agent'],
      'content-type': metadata.headers?.['content-type'],
      'accept-language': metadata.headers?.['accept-language'],
      accept: metadata.headers?.accept,
    };

    const input = {
      reqId: metadata.requestId,
      method: metadata.method,
      url: metadata.url,
      protocol: metadata.protocol,
      query: metadata.query,
      params: metadata.params,
      ip: metadata.ip,
      locale: metadata.locale,
      headers: selectedHeaders,
    };

    const filtered = filterObject(input, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
      filterEmptyArray: true,
      filterEmptyObject: true,
    });

    return isEmptyObject(filtered) ? undefined : filtered;
  }

  private formatUnknown(value: unknown): unknown {
    if (isError(value)) {
      const base: Record<string, unknown> = {
        type: value.constructor.name,
        message: value.message,
      };

      if (this.configuration.isDebug && value.stack) {
        base.stack = value.stack;
      }

      const extras: Record<string, unknown> = {};
      for (const key of Object.keys(value)) {
        if (!(key in base)) {
          extras[key] = (value as any)[key];
        }
      }

      return Object.keys(extras).length > 0 ? { ...base, ...extras } : base;
    }

    if (Buffer.isBuffer(value)) return '[Buffer]';
    if (value && typeof (value as { readonly pipe?: unknown }).pipe === 'function') return '[Stream]';

    if (isObject(value)) {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return { type: 'NonSerializableObject' };
      }
    }

    if (isPrimitive(value)) return value;

    return String(value);
  }

  private makeInstance(): Logger {
    const config = this.configuration.logger;

    if (!config.enabled) {
      return pino({
        enabled: false,
        timestamp: true,
      });
    }

    const transports = config.transports;
    const level = this.makeGlobalLogLevel(transports);

    const options: LoggerOptions = {
      level,
      enabled: true,
      timestamp: true,
      transport: {
        targets: this.makeTransportTargets(transports),
      },
    };

    return pino(options);
  }

  private makeTransportTargets(input: readonly TransportOptions[]): pino.TransportTargetOptions[] {
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

  private makeConsoleTransportTarget(config: ConsoleTransportOptions): pino.TransportTargetOptions {
    const level = this.makeTransportLevel(config.level);

    return {
      target: 'pino-pretty',
      level,
      options: config.pretty,
    };
  }

  private makeFileTransportTarget(config: FileTransportOptions): pino.TransportTargetOptions {
    const level = this.makeTransportLevel(config.level);
    const destination = path.isAbsolute(config.path)
      ? path.normalize(config.path)
      : resolvePath(process.cwd(), config.path);

    ensureDirectory(path.dirname(destination));

    if (this.configuration.isDebug) {
      console.info(`[ApiKit:Logger] File transport enabled: level=${level}, destination=${destination}`);
    }

    return {
      target: 'pino/file',
      level,
      options: { destination },
    };
  }

  private makeTransportLevel(requested?: Level): Level {
    if (this.configuration.isDebug) return 'trace';
    return requested ?? 'info';
  }

  private makeGlobalLogLevel(transports: readonly TransportOptions[]): Level {
    if (this.configuration.isDebug) return 'trace';

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
