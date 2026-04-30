import type { FastifyStaticOptions } from '@fastify/static';

export interface StaticFilesConfig {
  /**
   * Enables static file serving.
   *
   * @optional
   * @default true
   */
  enabled: boolean;

  /**
   * Root directory containing static files.
   *
   * @required
   *
   * @example resolvePath(import.meta.url, './src/public')
   */
  rootPath: string;

  /**
   * URL prefix used to serve static files.
   *
   * @optional
   * @default "/"
   */
  routePrefix: string;

  /**
   * Cache-Control max-age value in seconds.
   *
   * @optional
   * @default 3600
   */
  maxAge: number;

  /**
   * Controls how dotfiles are handled.
   *
   * @optional
   * @default "ignore"
   */
  dotfiles: FastifyStaticOptions['dotfiles'];

  /**
   * Enables HTTP ETag headers.
   *
   * @optional
   * @default true
   */
  etag: boolean;

  /**
   * Marks served files as immutable.
   *
   * @optional
   * @default true
   */
  immutable: boolean;

  /**
   * Adds static file helpers to Fastify replies.
   *
   * @optional
   * @default true
   */
  decorateReply: boolean;

  /**
   * Serves pre-compressed files when matching files are available.
   *
   * @optional
   * @default false
   */
  preCompressed: boolean;
}
