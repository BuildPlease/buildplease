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

/**
 * Console Transport
 */

/**
 * Console transport using `pino-pretty` formatter.
 */
export interface ConsoleTransportOptions extends BaseTransportOptions {
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
 * File Transport
 */

export interface FileTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: file.
   */
  type: 'file';

  /**
   * Environment variable key that contains the log file path.
   *
   * The resolved path value:
   * - Absolute paths are used as-is.
   * - Relative paths are resolved against `process.cwd()`.
   *
   * @required
   * @example "LOGGER_PATH"
   */
  envPathKey: string;
}

/**
 * Logger Configuration
 */

export type TransportOptions = ConsoleTransportOptions | FileTransportOptions;

export interface LoggerConfig {
  /**
   * Whether logging is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * A list of transport configurations for the logger.
   * Each transport can have its own type and options.
   */
  transports: TransportOptions[];
}
