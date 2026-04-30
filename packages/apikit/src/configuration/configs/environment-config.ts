export interface EnvironmentConfig {
  /**
   * Enables debug mode for this environment.
   *
   * When set to true, additional diagnostic information may be logged
   * or included in responses.
   *
   * @optional
   * @default false
   */
  debug: boolean;

  /**
   * Environment name.
   *
   * @required
   *
   * @example "test"
   * @example "production"
   */
  name: string;

  /**
   * Environment file name or path.
   *
   * @required
   *
   * @example ".env.test"
   * @example "./env/.env.production"
   */
  file: string;

  /**
   * Directory used to resolve relative environment file paths.
   *
   * @optional
   * @default process.cwd()
   */
  fileDir: string;
}
