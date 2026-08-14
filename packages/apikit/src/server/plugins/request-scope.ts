import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { RequestScope } from '@/request';
import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-request-scope';

/**
 * @description Initializes the per-request AsyncLocalStorage scope.
 *
 * The plugin stores already resolved request metadata in `RequestScope` so
 * downstream hooks, handlers, controllers, providers, and loggers can access
 * request-local data without passing it manually through every call.
 *
 * @remarks
 * This plugin depends on `apikit-request-metadata` because the metadata object
 * must exist before the request scope is created. Avoid detached async work that
 * intentionally escapes the Fastify request lifecycle.
 */
const requestScopePlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify) => {
  fastify.addHook('onRequest', (request, _reply, done) => {
    const metadata = request.metadata;

    RequestScope.run({ metadata: metadata }, () => {
      done();
    });
  });
};

export default fp(requestScopePlugin, {
  name: pluginName,
  dependencies: ['apikit-request-metadata'],
});
