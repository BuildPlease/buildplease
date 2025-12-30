import path from 'node:path';

import { injectable, inject } from 'inversify';
import pino, { type Logger, type Level, type Bindings, type LoggerOptions } from 'pino';

import { isError, isObject, isEmptyObject, isPrimitive, filterObject } from '@nidavellirx/meowv-core';
import { resolvePath, createDirectory, createFile } from '@nidavellirx/meowv-core/node';

import { ApiKitSymbols } from '@/di';
import type {
  ApiKitController,
  TransportOptions,
  ConsoleTransportOptions,
  PrettyConsoleTransportOptions,
  FileTransportOptions,
} from '@/configuration';
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
  public instance: Logger;

  constructor(
    @inject(ApiKitSymbols.DI.Configuration.Controller)
    private configuration: ApiKitController,
  ) {
    const transports = this.configuration.logger.transports;
    const level = this.resolveGlobalLogLevel(transports);

    const options: LoggerOptions = {
      level: level,
    };

    // MARK: - Only supply a transport block if user configured any transports
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

  /**
   * Specialized formatter for errors, built on top of `formatUnknown`.
   */
  private formatError(error: unknown): unknown {
    return this.formatUnknown(error);
  }

  /**
   * Specialized formatter for miscellaneous details, built on top of `formatUnknown`.
   */
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

    console.info(`\x1b[32m[Logger]:\x1b[0m path → ${absFile}`);

    return {
      target: 'pino/file',
      options: {
        destination: absFile,
        level: config.level,
      },
    };
  }

  /**
   * Resolves the effective global Pino log level.
   *
   * The global level is a **threshold**: Pino will drop any log calls below it
   * before they ever reach transports. To avoid accidentally filtering out logs
   * that a transport is configured to accept, we pick the most permissive
   * (lowest) level across all configured transports.
   *
   * Debug override:
   * - When {@link ApiKitController.isDebug} is enabled, the global level is forced
   *   to `"trace"` so nothing is filtered globally.
   * - Individual transport {@link BaseTransportOptions.level | levels} still apply
   *   (e.g. file can stay at `"info"` while console shows `"trace"`).
   *
   * @param transports
   *   Configured logger transport definitions.
   *
   * @returns
   *   The effective global Pino level (defaults to `"info"` when no transport level is set).
   *
   * @example
   * // Console wants "debug", file wants "warn" → global must be "debug"
   * // so debug logs are not filtered out before reaching console.
   * const level = resolveGlobalLogLevel([
   *   { type: 'console', level: 'debug', target: 'pino-pretty', pretty: {} },
   *   { type: 'file', level: 'warn', path: './logs/app.log' },
   * ]);
   * // level === 'debug'
   */
  private resolveGlobalLogLevel(transports: TransportOptions[]): Level {
    const fallback: Level = 'info';
    if (this.configuration.isDebug) return 'trace';

    const weights = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5,
    } satisfies Record<Level, number>;

    const levels = transports.map((t) => t.level ?? fallback);
    let lowest: Level = fallback;
    for (const level of levels) if (weights[level] < weights[lowest]) lowest = level;
    return lowest;
  }
}
