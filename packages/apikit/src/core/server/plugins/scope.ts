import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

import { RequestScope } from '#/request';
import type { ServerPluginOptions } from '#/server';

/**
 * This plugin initializes the per-request AsyncLocalStorage-based RequestScope.
 *
 * It uses Fastify's `onRequest` hook to call `RequestScope.run(...)`,
 * which creates an isolated async context for every incoming HTTP request.
 *
 * ✅ Why this works:
 * - Fastify executes all downstream hooks, preHandlers, and handlers
 *   within the same async call chain after `onRequest`.
 * - The callback passed to `RequestScope.run(...)` does not need
 *   to contain logic — it just ensures that subsequent async operations
 *   (including DI, controllers, logging, etc.) have access to the scoped context.
 * - `RequestScope.get()` will return the correct data inside any part
 *   of the app, as long as it's executed within Fastify's lifecycle.
 *
 * 🚫 Avoid breaking the async context (e.g., using raw `setTimeout` or detached promises).
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
  name: 'apikit-scope',
});
