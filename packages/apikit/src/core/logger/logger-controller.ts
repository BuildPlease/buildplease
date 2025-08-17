import path from 'node:path';

import { injectable, inject } from 'inversify';
import type { Bindings, Logger, Level } from 'pino';
import { type LoggerOptions, pino } from 'pino';

import { filterObject, isEmptyObject } from '@nidavellirx/meowv-core';

import { ApiKitSymbols } from '#/di';
import type {
  ApiKitController,
  TransportOptions,
  ConsoleTransportOptions,
  PrettyConsoleTransportOptions,
  FileTransportOptions,
} from '#/configuration';
import type { LogOptions } from '#/logger';
import type { RequestMetadata } from '#/request';
import { resolvePath, createDirectory, createFile } from '#/file';

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
  public instance: Logger;

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
  ) {
    const transports = this.configuration.logger.transports;
    const level = this.resolveGlobalLogLevel(transports);

    const options: LoggerOptions = { level };

    // only supply a transport block if user actually configured any transports
    if (transports.length > 0) {
      options.transport = { targets: this.makeTransportTargets(transports) };
    }

    this.instance = pino(options);
  }

  // MARK: - Public

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
    return this.instance.child(bindings);
  }

  // MARK: - Private: Log

  private log(level: pino.Level, title: string, options?: LogOptions) {
    const logObject: {
      flag?: string;
      details?: object;
      error?: object;
      metadata?: object;
    } = {};

    if (options?.flag) {
      logObject.flag = options.flag;
    }
    if (options?.details) {
      logObject.details = options.details;
    }
    if (options?.error) {
      logObject.error = this.formatError(options.error);
    }
    if (options?.metadata) {
      const formatted = this.formatMetadata(options.metadata);
      if (formatted) logObject.metadata = formatted;
    }

    this.instance[level]({ msg: title, ...logObject });
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

  // MARK: - Private: Configuration

  private makeTransportTargets(input: TransportOptions[]): pino.TransportTargetOptions[] {
    if (input.filter((t) => t.type === 'console').length > 1) {
      throw new Error('[Logger] Multiple console transports are not supported.');
    }

    const transports: pino.TransportTargetOptions[] = [];

    input.forEach((transportConfig) => {
      const type = transportConfig.type;
      switch (type) {
        case 'console':
          const consoleTransport = this.makeConsoleTransportTarget(transportConfig);
          transports.push(consoleTransport);
          break;
        case 'file':
          const fileTransport = this.makeFileTransportTarget(transportConfig);
          transports.push(fileTransport);
          break;
        default:
          throw new Error(`Unsupported transport type: ${type}`);
      }
    });

    return transports;
  }

  private makeConsoleTransportTarget(config: ConsoleTransportOptions): pino.TransportTargetOptions {
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

    throw new Error(`Unsupported console target: ${target}`);
  }

  private makeFileTransportTarget(config: FileTransportOptions): pino.TransportTargetOptions {
    const absFile = resolvePath(process.cwd(), config.path);

    createDirectory(path.dirname(absFile));
    createFile(absFile);

    return {
      target: 'pino/file',
      options: {
        destination: absFile,
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
