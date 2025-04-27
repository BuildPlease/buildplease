interface BaseTransportOptions {
  /**
   * The minimum level of logs to capture.
   * @options 'trace', 'debug', 'info', 'warn', 'error'
   */
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error';

  /**
   * Indicates whether to include timestamps in log entries.
   * @default false
   */
  timestamp: boolean;
}

export interface ConsoleTransportOptions extends BaseTransportOptions {
  /**
   * Defines the transport type. Must be 'console' for console-based transport.
   */
  type: 'console';

  /**
   * Specifies the target transport.
   * @options 'pino-pretty', 'console'
   */
  target: 'pino-pretty' | 'console';

  /**
   * Options for formatting console output when using 'pino-pretty'.
   */
  pretty?: {
    /**
     * Enables or disables colorized output in the console.
     * @default false
     */
    colorize?: boolean;

    /**
     * Specifies the timestamp format.
     * @default 'SYS:standard'
     */
    translateTime?: string | boolean;

    /**
     * Specifies whether to print the log level before the log message.
     * @default false
     */
    levelFirst?: boolean;

    /**
     * A comma-separated list of keys to exclude from the log output (e.g., 'pid,hostname').
     * @default 'pid,hostname'
     */
    ignore?: string;
  };
}

export interface FileTransportOptions extends BaseTransportOptions {
  /**
   * Defines the transport type. Must be 'file' for file-based logging.
   */
  type: 'file';

  /**
   * The path to the log file.
   * @required
   * @example './logs/app.log'
   */
  logFilePath: string;

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

export type TransportOptions = ConsoleTransportOptions | FileTransportOptions;

export interface LoggerConfig {
  /**
   * A list of transport configurations for the logger.
   * Each transport can have its own type and options.
   * @required
   */
  transports: TransportOptions[];
}
