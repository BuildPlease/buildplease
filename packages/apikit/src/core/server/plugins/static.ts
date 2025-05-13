import fp from 'fastify-plugin';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

import { resolvePath } from '#/utils';
import type { ServerPluginOptions } from '#/server';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const configuration = options.apikitController.server.staticFiles ?? {};

  const { path = 'public', routePrefix = '/', maxAge = 3600 } = configuration;

  const pluginOptions: FastifyStaticOptions = {
    root: resolvePath(process.cwd(), path),
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
