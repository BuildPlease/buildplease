import multipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'Apikit@multipart';

const multipartPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.multipart;

  if (!config.enabled) return;

  await fastify.register(multipart, config.options);
};

export default fp(multipartPlugin, {
  name: pluginName,
});
