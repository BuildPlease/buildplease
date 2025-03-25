import { LoggerConfig } from '#/configuration/loggerConfig';

export interface EnvironmentConfig {
  /**
   * Name of the environment (e.g., 'production', 'development').
   */
  name: string;

  /**
   * Path to the environment file (e.g., `.env.production`).
   * This is a required field.
   */
  file: string;

  /**
   * Directory containing the environment file.
   * Defaults to the project root if not specified.
   */
  fileDir?: string;

  /**
   * Logger configuration
   */
  logger: Required<LoggerConfig>;
}
