import cookie from './cookie';
import ip from './ip';
import logger from './logger';
import metadata from './metadata';
import scope from './scope';
import staticFiles from './static';
import view from './view';

/**
 * ApiKit-built-in Fastify plugins.
 *
 * Use these when you need explicit control over plugin registration order/encapsulation.
 */
const Plugins = {
  cookie,
  ip,
  logger,
  metadata,
  scope,
  staticFiles,
  view,
};

export default Plugins;

/**
 * Fastify helpers and upstream plugin re-exports.
 *
 * Convenience exports for consumers to register plugins with correct typings
 * without adding extra direct dependencies.
 */
export { default as fp } from 'fastify-plugin';

export { default as fastifyCookie } from '@fastify/cookie';
export type { FastifyCookieOptions } from '@fastify/cookie';

export { default as fastifyStatic } from '@fastify/static';
export type { FastifyStaticOptions } from '@fastify/static';

export { default as fastifyView } from '@fastify/view';
export type { PointOfViewOptions } from '@fastify/view';
