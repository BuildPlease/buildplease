import type { FastifyStaticOptions } from '@fastify/static';

export interface StaticFilesConfig {
  /**
   * Enable static file serving.
   * @default true
   */
  enabled?: boolean;

  /**
   * Absolute or resolved path to static assets.
   * @example resolvePath(import.meta.url, './src/public')
   */
  rootPath: string;

  /**
   * Route prefix for serving static files.
   * @default '/'
   */
  routePrefix?: string;

  /**
   * Cache control max-age (in seconds).
   * @default 3600 (1 hour)
   */
  maxAge?: number;

  /**
   * How to treat dotfiles.
   * @default 'ignore'
   */
  dotfiles?: FastifyStaticOptions['dotfiles'];

  /**
   * Enable HTTP ETag headers.
   * @default true
   */
  etag?: boolean;

  /**
   * Mark static assets as immutable.
   * @default true
   */
  immutable?: boolean;

  /**
   * Attach `reply.sendFile()` helper to Fastify reply object.
   * @default true
   */
  decorateReply?: boolean;

  /**
   * Serve `.gz` or `.br` pre-compressed files if available.
   * @default false
   */
  preCompressed?: boolean;
}
