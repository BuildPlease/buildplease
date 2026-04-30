import type { FastifyPluginAsync } from 'fastify';
import fastifyMetrics from 'fastify-metrics';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit_fastify-metrics';

const metricsPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.metrics;

  if (!config.enabled) {
    fastify.log.info(`[${pluginName}] Metrics disabled — skipping`);
    return;
  }

  await fastify.register(fastifyMetrics, {
    endpoint: config.endpoint,
    defaultMetrics: {
      enabled: true,
    },
    routeMetrics: {
      enabled: true,
    },
  });

  fastify.log.info(`[${pluginName}] Metrics enabled on ${config.endpoint}`);
};

export default fp(metricsPlugin, {
  name: pluginName,
});
