export interface StaticFilesConfig {
  /**
   * Enable static file serving
   * @default true
   */
  enabled?: boolean;

  /**
   * Path to directory containing static assets, relative to the project root
   * Should be resolved via `resolvePath`.
   *
   * @example
   * resolvePath(import.meta.url, './src/public')
   * @default
   * resolvePath(process.cwd(), 'public')
   */
  path?: string;

  /**
   * URL prefix for static routes
   * @default '/'
   */
  routePrefix?: string;

  /**
   * Cache control max-age in seconds
   * @default 3600 (1 hour)
   */
  maxAge?: number;
}
