import fpCookie from './cookie';
import fpIp from './ip';
import fpLogger from './logger';
import fpMetadata from './metadata';
import fpScope from './scope';
import fpStaticFiles from './static';
import fpView from './view';

/**
 * Built-in Fastify plugins.
 *
 */
export const FastifyPlugins = {
  cookie: fpCookie,
  ip: fpIp,
  logger: fpLogger,
  metadata: fpMetadata,
  scope: fpScope,
  staticFiles: fpStaticFiles,
  view: fpView,
} as const;

export { fpCookie, fpIp, fpLogger, fpMetadata, fpScope, fpStaticFiles, fpView };

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
export type { FastifyViewOptions } from '@fastify/view';
