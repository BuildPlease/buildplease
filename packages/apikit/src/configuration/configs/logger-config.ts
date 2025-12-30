import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

/**
 * Base transport configuration options.
 */
interface BaseTransportOptions {
  /**
   * The minimum level of logs to capture **for this transport**.
   *
   * Note: When {@link EnvironmentConfig.debug} is enabled, ApiKit forces the global
   * logger level to `"trace"`; transport levels still apply.
   *
   * @default 'info'
   */
  level?: Level;
}

// ────────────────────────────────────────────────────────────────────────────────
// Console transport types

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
export type ConsoleTransportOptions = PrettyConsoleTransportOptions;

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
   * Path to the log file.
   *
   * - Absolute paths are used as-is.
   * - Relative paths are resolved against `process.cwd()`.
   *
   * @example "./logs/app.log"
   * @example "/var/log/my-app/app.log"
   * @example resolvePath(import.meta.url, "./logs/app.log")
   */
  path: string;
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
