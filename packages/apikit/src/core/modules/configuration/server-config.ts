export interface ServerConfig {
  /**
   * Unique identifier for the server configuration.
   * This must be unique across all server configurations.
   */
  identifier: string;

  /**
   * Server host address
   */
  host: string;

  /**
   * Server port number
   */
  port: number;

  /**
   * Trust proxy configuration
   * @see https://www.fastify.io/docs/latest/Reference/Server/#trustproxy
   * @default false
   */
  trustProxy?:
    | boolean
    | string
    | number
    | string[]
    | ((address: string, hop: number) => boolean);

  /**
   * Static files configuration
   */
  staticFiles?: StaticFilesConfig;
}

export interface StaticFilesConfig {
  /**
   * Enable static file serving
   * @default true
   */
  enabled?: boolean;

  /**
   * Directory containing static assets, relative to the project root
   * @default 'public'
   */
  directory?: string;

  /**
   * URL prefix for static routes
   * @default '/public'
   */
  routePrefix?: string;

  /**
   * Cache control max-age in seconds
   * @default 3600 (1 hour)
   */
  maxAge?: number;
}
