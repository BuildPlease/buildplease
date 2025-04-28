import type { EnvironmentConfig, EmailConfig, LoggerConfig, ServerConfig } from './';

/**
 * Configuration options for the Meowv API Kit.
 */
export interface ApiKitConfig {
  /**
   * The output directory where the generated API files will be stored.
   * If not specified, it defaults to `.apikit`.
   *
   * @default ".apikit"
   */
  outDir?: string;

  /**
   * A list of environment configurations.
   * Each environment defines specific settings for different runtime contexts.
   */
  environments: readonly EnvironmentConfig[];

  /**
   * Server configurations mapped by environment or custom keys.
   * Defines settings such as host, port, and other server options.
   */
  server: Record<string, ServerConfig>;

  /**
   * Logger configurations mapped by environment or custom keys.
   * Defines logging behavior such as log level, output format, etc.
   */
  logger: Record<string, LoggerConfig>;

  /**
   * Email configurations mapped by environment or custom keys.
   * Defines email template base paths and whether email sending is enabled.
   *
   */
  email: Record<string, EmailConfig>;
}
