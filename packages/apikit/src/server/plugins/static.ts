import fastifyStatic from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-static';
const LOG_PREFIX = '[ApiKit:Static]';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.staticFiles;

  if (!config.enabled) {
    fastify.log.info(`${LOG_PREFIX} Disabled — skipping`);
    return;
  }

  if (!config.publicDirectory) {
    const message = `${LOG_PREFIX} publicDirectory is required when static files are enabled.`;

    fastify.log.error(message);
    throw new Error(message);
  }

  await fastify.register(fastifyStatic, {
    root: config.publicDirectory,
    prefix: config.routePrefix,
    maxAge: config.maxAge,
    dotfiles: config.dotfiles,
    etag: config.etag,
    immutable: config.immutable,
    decorateReply: config.decorateReply,
    preCompressed: config.preCompressed,
  });

  fastify.log.info(`${LOG_PREFIX} Enabled from ${config.publicDirectory}`);
};

export default fp(staticFilesPlugin, {
  name: pluginName,
});
