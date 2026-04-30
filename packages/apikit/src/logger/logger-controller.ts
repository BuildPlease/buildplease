import path from 'node:path';

import { filterObject, isEmptyObject, isError, isObject, isPrimitive } from '@meawkit/core';
import { ensureDirectory, env, resolvePath } from '@meawkit/core/node';
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
    const logData: Record<string, unknown> = {};

    if (options?.flag) {
      logData.flag = options.flag;
    }
    if (options?.details) {
      logData.details = this.formatDetails(options.details);
    }
    if (options?.error) {
      logData.error = this.formatError(options.error);
    }
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

  /**
   * Normalizes arbitrary values into JSON-safe structures.
   *
   * - Error instances → { type, message, stack, ...extras }
   * - Buffer → "[Buffer]"
   * - Stream → "[Stream]"
   * - Plain object → deep-cloned JSON
   * - Primitive → { type, value }
   * - Fallback → { type, value: String(value) }
   */
  private formatUnknown(value: unknown): unknown {
    // Errors
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

    // Buffers
    if (Buffer.isBuffer(value)) return '[Buffer]';

    // Streams
    if (value && typeof (value as any).pipe === 'function') return '[Stream]';

    // Plain objects
    if (isObject(value)) {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return { type: 'NonSerializableObject' };
      }
    }

    // Primitives
    if (isPrimitive(value)) return value;

    // Fallback
    return String(value);
  }

  // MARK: - Private: Configuration

  private makeInstance(): Logger {
    const config = this.configuration.logger;
    const transports = config.transports;

    if (!Array.isArray(transports)) {
      throw new Error('[Logger] Invalid config: "transports" must be an array.');
    }

    const disabled = config.disabled === true;
    const enabled = !disabled && transports.length > 0;
    const level = this.makeGlobalLogLevel(transports);

    const options: LoggerOptions = {
      level: level,
      enabled: enabled,
      timestamp: true,
    };

    if (enabled) {
      options.transport = { targets: this.makeTransportTargets(transports) };
    }

    return pino(options);
  }

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
    const level = this.makeTransportLevel(config.level);

    return {
      target: 'pino-pretty',
      level: level,
      options: config.pretty,
    };
  }

  private makeFileTransportTarget(config: FileTransportOptions): pino.TransportTargetOptions {
    const filePath = env(config.envPathKey);
    const level = this.makeTransportLevel(config.level);

    const destination = path.isAbsolute(filePath)
      ? path.normalize(filePath)
      : resolvePath(process.cwd(), filePath);

    ensureDirectory(path.dirname(destination));

    if (this.configuration.isDebug) {
      console.info(`\x1b[32m✔\x1b[0m LOGGER level: ${level}, destination: ${destination}`);
    }

    return {
      target: 'pino/file',
      level: level,
      options: {
        destination: destination,
      },
    };
  }

  private makeTransportLevel(requested: Level): Level {
    if (this.configuration.isDebug) return 'trace';
    return requested;
  }

  /**
   * Resolves the effective global Pino log level.
   *
   * The global level is a threshold: Pino drops log calls below this level
   * before they reach transports. To avoid filtering logs too early, ApiKit
   * uses the most permissive transport level.
   *
   * Debug override:
   * - When debug mode is enabled, the global level is forced to `"trace"`.
   * - Individual transport levels are resolved by `makeTransportLevel`.
   *
   * @param transports
   *   Configured logger transport definitions.
   *
   * @returns
   *   The effective global Pino level.
   *   Returns `"info"` when no transports are configured.
   */
  private makeGlobalLogLevel(transports: TransportOptions[]): Level {
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
