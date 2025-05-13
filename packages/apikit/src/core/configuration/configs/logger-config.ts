import type { PrettyOptions } from 'pino-pretty';

/**
 * Defines valid log levels.
 * @options 'trace', 'debug', 'info', 'warn', 'error'
 *
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

/**
 * Base transport configuration options.
 */
interface BaseTransportOptions {
  /**
   * The minimum level of logs to capture.
   * @default 'info'
   */
  level?: LogLevel;
}

// ────────────────────────────────────────────────────────────────────────────────
// Console transport types

/**
 * Console transport using raw `console` output.
 */
export interface RawConsoleTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: console.
   */
  type: 'console';

  /**
   * Specifies the target transport.
   * Must be 'console' for raw output.
   */
  target: 'console';

  /**
   * Indicates whether to include timestamps in log entries.
   * @default false
   */
  timestamp: boolean;
}

/**
 * Console transport using `pino-pretty` formatter.
 */
export interface PrettyConsoleTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: console.
   */
  type: 'console';

  /**
   * Specifies the target transport.
   * Must be 'pino-pretty' for pretty output.
   */
  target: 'pino-pretty';

  /**
   * Options for formatting console output.
   * Taken directly from `pino-pretty` typings.
   */
  pretty?: PrettyOptions;
}

/**
 * All supported console transport variants.
 */
export type ConsoleTransportOptions = RawConsoleTransportOptions | PrettyConsoleTransportOptions;

// ────────────────────────────────────────────────────────────────────────────────
// File transport

/**
 * File-based logging transport.
 */
export interface FileTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: file.
   */
  type: 'file';

  /**
   * The path to the log file.
   * @required
   * @example './logs/app.log'
   */
  logFilePath: string;

  /**
   * Indicates whether to include timestamps in log entries.
   * @default true
   */
  timestamp: boolean;

  /**
   * Additional options specific to file transport.
   */
  options?: {
    /**
     * Specifies whether to use synchronous writes to the log file.
     * @default false
     */
    sync?: boolean;

    /**
     * The file permissions for the log file.
     * @default 0o666
     */
    mode?: number;

    /**
     * Determines whether to create the directory if it does not exist.
     * @default false
     */
    mkdir?: boolean;
  };
}

// ────────────────────────────────────────────────────────────────────────────────

/**
 * All supported logger transports.
 */
export type TransportOptions = ConsoleTransportOptions | FileTransportOptions;

/**
 * Full logger configuration structure.
 */
export interface LoggerConfig {
  /**
   * A list of transport configurations for the logger.
   * Each transport can have its own type and options.
   * @required
   */
  transports: TransportOptions[];
}
