import fpBasicAuth from './basic-auth';
import fpCookie from './cookie';
import fpCors from './cors';
import fpHealth from './health';
import fpIp from './ip';
import fpLogger from './logger';
import fpMetadata from './metadata';
import fpMetrics from './metrics';
import fpMultipart from './multipart';
import fpScope from './scope';
import fpStaticFiles from './static';
import fpView from './view';

// MARK: - Plugins

export const FastifyPlugins = {
  basicAuth: fpBasicAuth,
  cookie: fpCookie,
  cors: fpCors,
  health: fpHealth,
  ip: fpIp,
  logger: fpLogger,
  metadata: fpMetadata,
  metrics: fpMetrics,
  multipart: fpMultipart,
  scope: fpScope,
  staticFiles: fpStaticFiles,
  view: fpView,
} as const;

// MARK: - Fastify Plugin

export { default as fp } from 'fastify-plugin';

// MARK: - Plugin Exports

export { default as fastifyBasicAuth } from '@fastify/basic-auth';
export { default as fastifyCookie } from '@fastify/cookie';
export { default as fastifyUnderPressure } from '@fastify/under-pressure';
export { default as fastifyCors } from '@fastify/cors';
export { default as fastifyMultipart } from '@fastify/multipart';
export { default as fastifyStatic } from '@fastify/static';
export { default as fastifyView } from '@fastify/view';
export { default as fastifyIp } from 'fastify-ip';
export { default as fastifyMetrics } from 'fastify-metrics';
