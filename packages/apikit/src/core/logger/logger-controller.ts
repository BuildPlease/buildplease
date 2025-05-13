import { injectable, inject } from 'inversify';
import type { Bindings, Logger, Level } from 'pino';
import pino from 'pino';

import { filterObject, isEmptyObject } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import type {
  ApiKitController,
  TransportOptions,
  ConsoleTransportOptions,
  PrettyConsoleTransportOptions,
  RawConsoleTransportOptions,
  FileTransportOptions,
} from '#/configuration';
import type { LogOptions } from '#/logger';
import type { RequestMetadata } from '#/request';
import { ensureDirectory, createFile } from '#/utils';

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
  private logger: Logger;

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
  ) {
    const loggerConfig = this.configuration.logger;
    const targets = this.createTargets(loggerConfig.transports);
    const transport = pino.transport({ targets: targets });
    const globalLevel = this.resolveGlobalLogLevel(loggerConfig.transports);

    this.logger = pino({ level: globalLevel }, transport);
  }

  // MARK: - Public

  public get instance(): Logger {
    return this.logger;
  }

  public info(title: string, options?: LogOptions) {
    this.log('info', title, options);
  }

  public debug(title: string, options?: LogOptions) {
    this.log('debug', title, options);
  }

  public trace(title: string, options?: LogOptions) {
    this.log('trace', title, options);
  }

  public warn(title: string, options?: LogOptions) {
    this.log('warn', title, options);
  }

  public error(title: string, options?: LogOptions) {
    this.log('error', title, options);
  }

  public fatal(title: string, options?: LogOptions) {
    this.log('fatal', title, options);
  }

  public child(bindings: Bindings) {
    return this.logger.child(bindings);
  }

  // MARK: - Private: Log

  private log(level: pino.Level, title: string, options?: LogOptions) {
    const logObject: {
      flag?: string;
      content?: object;
      error?: object;
      metadata?: object;
    } = {};

    if (options?.flag) {
      logObject.flag = options.flag;
    }
    if (options?.content) {
      logObject.content = options.content;
    }
    if (options?.error) {
      logObject.error = this.formatError(options.error);
    }
    if (options?.metadata) {
      const formatter = this.formatMetadata(options.metadata);
      if (formatter) logObject.metadata = formatter;
    }

    this.logger[level]({ msg: title, ...logObject });
  }

  private formatError(error: unknown): object {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const fallbackMessage = 'No specific error message provided';
      const errorMessage = (error as { message?: string }).message;
      return { ...error, message: errorMessage || fallbackMessage };
    }

    return {
      message: `Non-Error type thrown: ${String(error)}`,
      value: error,
    };
  }

  private formatMetadata(metadata: Partial<RequestMetadata>): object | undefined {
    const selectedHeaders = {
      accept: metadata.headers?.accept,
      'content-type': metadata.headers?.['content-type'],
      'user-agent': metadata.headers?.['user-agent'],
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

  // MARK: - Private: Configuration

  private createTargets(userTransports: TransportOptions[]): pino.TransportTargetOptions[] {
    const transports: pino.TransportTargetOptions[] = [];

    userTransports.forEach((transportConfig) => {
      const type = transportConfig.type;
      switch (type) {
        case 'console':
          transports.push(this.createConsoleTarget(transportConfig as ConsoleTransportOptions));
          break;
        case 'file':
          transports.push(this.createFileTarget(transportConfig as FileTransportOptions));
          break;
        default:
          throw new Error(`Unsupported transport type: ${type}`);
      }
    });

    return transports;
  }

  private createConsoleTarget(config: ConsoleTransportOptions): pino.TransportTargetOptions {
    const { target, level } = config;

    if (target === 'pino-pretty') {
      const prettyConfig = config as PrettyConsoleTransportOptions;

      return {
        target: 'pino-pretty',
        options: {
          level: level,
          ...prettyConfig.pretty,
        },
      };
    }

    if (target === 'console') {
      const rawConfig = config as RawConsoleTransportOptions;

      return {
        target: 'console',
        options: {
          level: level,
          timestamp: rawConfig.timestamp,
        },
      };
    }

    throw new Error(`Unsupported console target: ${target}`);
  }

  private createFileTarget(config: FileTransportOptions): pino.TransportTargetOptions {
    let fileDestination: string;

    try {
      fileDestination = ensureDirectory(config.path);
    } catch {
      fileDestination = createFile(config.path);
    }

    return {
      target: 'pino/file',
      options: {
        destination: fileDestination,
        level: config.level,
      },
    };
  }

  private resolveGlobalLogLevel(transports: TransportOptions[]): Level {
    const fallback: Level = 'info';
    const weights: Record<Level, number> = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5,
    };

    return transports.reduce<Level>((lowest, t) => {
      const level = (t.level ?? fallback) as Level;
      return weights[level] < weights[lowest] ? level : lowest;
    }, fallback);
  }
}
