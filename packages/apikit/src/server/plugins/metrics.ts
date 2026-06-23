import type { FastifyPluginAsync } from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-metrics';
const LOG_PREFIX = '[ApiKit:Metrics]';

const metricsPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.metrics;

  if (!config.enabled) {
    fastify.log.info(`${LOG_PREFIX} Disabled — skipping`);
    return;
  }

  await fastify.register(fastifyMetrics, {
    endpoint: config.endpoint,
    name: config.name,
    defaultMetrics: config.defaultMetrics,
    routeMetrics: config.routeMetrics,
    clearRegisterOnInit: config.clearRegisterOnInit,
  });

  fastify.log.info(`${LOG_PREFIX} Enabled`);
};

export default fp(metricsPlugin, {
  name: pluginName,
});
