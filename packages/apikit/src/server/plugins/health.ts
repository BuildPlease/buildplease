import underPressure from '@fastify/under-pressure';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-health';
const LOG_PREFIX = '[ApiKit:Health]';

const healthPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.health;

  if (!config.enabled) {
    fastify.log.info(`${LOG_PREFIX} Disabled — skipping`);
    return;
  }

  await fastify.register(underPressure, {
    exposeStatusRoute: config.url,
    maxEventLoopDelay: config.pressure.maxEventLoopDelay,
    maxHeapUsedBytes: config.pressure.maxHeapUsedBytes,
    maxRssBytes: config.pressure.maxRssBytes,
    maxEventLoopUtilization: config.pressure.maxEventLoopUtilization,
  });

  fastify.log.info(`${LOG_PREFIX} Enabled`);
};

export default fp(healthPlugin, {
  name: pluginName,
});
