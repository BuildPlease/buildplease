import type { FastifyPluginAsync } from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'Apikit@metrics';

const metricsPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.metrics;

  if (!config.enabled) {
    fastify.log.info(`[${pluginName}] Metrics disabled — skipping`);
    return;
  }

  await fastify.register(fastifyMetrics, {
    endpoint: config.endpoint,
    name: config.name,
    defaultMetrics: config.defaultMetrics,
    routeMetrics: config.routeMetrics,
    clearRegisterOnInit: config.clearRegisterOnInit,
  });

  fastify.log.info(`[${pluginName}] Metrics enabled`);
};

export default fp(metricsPlugin, {
  name: pluginName,
});
