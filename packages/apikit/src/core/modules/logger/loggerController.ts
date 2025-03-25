import path from 'path';
import fs from 'fs';

import { injectable, inject } from 'inversify';
import pino, { Bindings, Logger } from 'pino';

import { filterObject } from '@nidavellirx/meowv-core';

import { ApikitSymbols } from '#/di';

import {
  type ConfigurationController,
  TransportOptions,
  ConsoleTransportOptions,
  FileTransportOptions,
} from '$/configuration';
import type { LogOptions } from '$/logger';
import type { HttpMetadata } from '$/http';

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
    @inject(ApikitSymbols.DI.Configuration.Controller)
    private configuration: ConfigurationController,
  ) {
    const loggerConfig = this.configuration.logger;
    const transports = this.createTransports(loggerConfig.transports);

    const transport = pino.transport({ targets: transports });

    this.logger = pino(transport);
  }

  private createTransports(
    userTransports: TransportOptions[],
  ): pino.TransportTargetOptions[] {
    const transports: pino.TransportTargetOptions[] = [];

    userTransports.forEach((transportConfig) => {
      const type = transportConfig.type;
      switch (type) {
        case 'console':
          transports.push(
            this.createConsoleTransport(
              transportConfig as ConsoleTransportOptions,
            ),
          );
          break;
        case 'file':
          transports.push(
            this.createFileTransport(transportConfig as FileTransportOptions),
          );
          break;
        default:
          throw new Error(`Unsupported transport type: ${type}`);
      }
    });

    return transports;
  }

  private createConsoleTransport(
    config: ConsoleTransportOptions,
  ): pino.TransportTargetOptions {
    const transportOptions: Record<string, any> = {
      level: config.level,
      timestamp: config.timestamp,
    };

    if (config.target === 'pino-pretty') {
      transportOptions.colorize = config.pretty?.colorize ?? true;
      transportOptions.translateTime =
        config.pretty?.translateTime ?? 'SYS:standard';
      transportOptions.levelFirst = config.pretty?.levelFirst ?? false;
      transportOptions.ignore = config.pretty?.ignore ?? 'pid,hostname';
    }

    if (config.target === 'console') {
    }

    return {
      target: config.target,
      options: transportOptions,
    };
  }

  private createFileTransport(
    config: FileTransportOptions,
  ): pino.TransportTargetOptions {
    const logPath = this.makeLogPath(config.logFilePath);

    const transportOptions = {
      level: config.level,
      timestamp: config.timestamp,
      destination: logPath,
      sync: config.options?.sync ?? false,
      mode: config.options?.mode ?? 0o666,
      mkdir: config.options?.mkdir ?? false,
    };

    return {
      target: 'pino/file',
      options: transportOptions,
    };
  }

  private makeLogPath(loggerPath: string): string {
    try {
      const logDir = path.dirname(loggerPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      return path.resolve(loggerPath);
    } catch (error) {
      throw new Error(
        `Failed to access or create logger directory at ${loggerPath}: ${error}`,
      );
    }
  }

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
      logObject.error = this.prepareErrorContent(options.error);
    }
    if (options?.metadata) {
      logObject.metadata = this.prepareHttpMetadata(options.metadata);
    }

    this.logger[level]({ msg: title, ...logObject });
  }

  private prepareErrorContent(error: unknown): object {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'object' && error !== null) {
      return {
        ...error,
        message:
          (error as { message?: string }).message ||
          'No specific error message provided',
      };
    }

    return {
      message: `Non-Error type thrown: ${String(error)}`,
      value: error,
    };
  }

  private prepareHttpMetadata(metadata: Partial<HttpMetadata>): object {
    const selectedHeaders = {
      accept: metadata.headers?.accept,
      'accept-language': metadata.headers?.['accept-language'],
      'content-type': metadata.headers?.['content-type'],
      'user-agent': metadata.headers?.['user-agent'],
    };

    const input = {
      reqId: metadata.reqId,
      method: metadata.method,
      url: metadata.url,
      protocol: metadata.protocol,
      query: metadata.query,
      params: metadata.params,
      ip: metadata.ip,
      headers: selectedHeaders,
    };

    return filterObject(input, {
      filterNull: true,
      filterUndefined: true,
      filterEmptyString: true,
      filterEmptyArray: true,
      filterEmptyObject: true,
    });
  }
}
