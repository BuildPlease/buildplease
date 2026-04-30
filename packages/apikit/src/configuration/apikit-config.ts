import type {
  EmailConfig,
  EnvironmentConfig,
  I18nConfig,
  LoggerConfig,
  MetricsConfig,
  ServerConfig,
  StaticFilesConfig,
} from '@/configuration/configs';

export interface ApiKitConfig {
  /**
   * Directory where generated ApiKit runtime files are written.
   */
  outDir: string;

  /**
   * Environment configurations available to ApiKit.
   */
  environments: readonly EnvironmentConfig[];

  /**
   * Server configurations mapped by environment name.
   */
  server: Record<string, ServerConfig>;

  /**
   * Logger configurations mapped by environment name.
   */
  logger: Record<string, LoggerConfig>;

  /**
   * Metrics configurations mapped by environment name.
   */
  metrics: Record<string, MetricsConfig>;

  /**
   * Email configuration.
   */
  email: EmailConfig;

  /**
   * Localization configuration.
   */
  i18n?: I18nConfig;

  /**
   * Static file serving configuration.
   *
   */
  staticFiles?: StaticFilesConfig;
}
