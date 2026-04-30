import type { Level } from 'pino';
import type { PrettyOptions } from 'pino-pretty';

export interface LoggerConfig {
  /**
   * Disables logger output.
   *
   * @optional
   * @default false
   */
  disabled: boolean;

  /**
   * Logger output transports.
   *
   * @optional
   * @default []
   */
  transports: TransportOptions[];
}

export type TransportOptions = ConsoleTransportOptions | FileTransportOptions;

export interface BaseTransportOptions {
  /**
   * Minimum log level written by this transport.
   *
   * @optional
   * @default "info"
   */
  level: Level;
}

export interface ConsoleTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: console.
   *
   * @required
   */
  type: 'console';

  /**
   * Pino transport target used for formatted console output.
   *
   * @required
   */
  target: 'pino-pretty';

  /**
   * Console output formatting options.
   *
   * @optional
   * @default {}
   */
  pretty: PrettyOptions;
}

export interface FileTransportOptions extends BaseTransportOptions {
  /**
   * Transport type: file.
   *
   * @required
   */
  type: 'file';

  /**
   * Environment variable key that contains the log file path.
   *
   * @required
   *
   * @example "LOGGER_PATH"
   */
  envPathKey: string;
}
