export interface EnvironmentConfig {
  /**
   * Enables verbose debug mode for environment.
   *
   * When set to true, additional diagnostic information may be logged
   * or included in responses to assist with development and troubleshooting.
   *
   * @default false
   */
  debug?: boolean;

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
}
