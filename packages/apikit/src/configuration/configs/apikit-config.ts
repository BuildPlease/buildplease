import type {
  EnvironmentConfig,
  EmailConfig,
  LoggerConfig,
  ServerConfig,
  I18nConfig,
  StaticFilesConfig,
} from './';

export interface ApiKitConfig {
  /**
   * The output directory where the generated API files will be stored.
   *
   * @default ".apikit"
   */
  outDir: string;

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
   * Email configurations
   * Defines email template base paths and whether email sending is enabled.
   *
   */
  email: EmailConfig;

  /**
   * Localization/i18n configuration for register custom file entries.
   */
  i18n?: I18nConfig;

  /**
   * Static files configuration
   */
  staticFiles?: StaticFilesConfig;
}
