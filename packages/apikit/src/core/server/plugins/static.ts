import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import fp from 'fastify-plugin';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

import type { ServerPluginOptions } from '#/server';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (
  fastify,
  options,
) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const configuration = options.apikitController.server.staticFiles ?? {};

  const {
    directory = 'public',
    routePrefix = '/',
    maxAge = 3600,
  } = configuration;

  const pluginOptions: FastifyStaticOptions = {
    root: resolve(__dirname, directory),
    prefix: routePrefix,
    maxAge,
    dotfiles: 'ignore',
    immutable: true,
    etag: true,
    serve: configuration.enabled,
    decorateReply: true,
  };

  await fastify.register(fastifyStatic, pluginOptions);
  fastify.log.info(`Serving static files from ${pluginOptions.root}`);
};

export default fp(staticFilesPlugin, {
  name: 'apikit-@fastify/static',
});
