import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

/**
 * Base transport configuration options.
 */
interface BaseTransportOptions {
  /**
   * The minimum level of logs to capture.
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
   * Absolute path to the log file.
   * Should be resolved via `resolvePath`.
   * @example resolvePath(import.meta.url, './logs/production.log')
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
