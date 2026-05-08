import fastifyStatic from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit_@fastify/static';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.staticFiles;

  if (!config.enabled) {
    fastify.log.info(`[${pluginName}] Static files disabled — skipping`);
    return;
  }

  if (!config.publicDirectory) {
    const message = `[${pluginName}] publicDirectory is required when static files are enabled.`;

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

  fastify.log.info(`[${pluginName}] Static files enabled from ${config.publicDirectory}`);
};

export default fp(staticFilesPlugin, {
  name: pluginName,
});
