import path from 'path';

import fp from 'fastify-plugin';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

import type { ServerPluginOptions } from '$/server';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (
  fastify,
  options,
) => {
  const configuration = options.configuration.server.staticFiles ?? {};

  if (configuration.enabled === false) {
    fastify.log.info('Static file serving disabled by configuration');
    return;
  }

  const {
    directory = 'public',
    routePrefix = '/public',
    maxAge = 3600,
  } = configuration;

  const pluginOptions: FastifyStaticOptions = {
    root: path.resolve(process.cwd(), directory),
    prefix: routePrefix,
    maxAge,
    dotfiles: 'ignore',
    immutable: true,
    etag: true,
    serve: true,
    decorateReply: false,
  };

  await fastify.register(fastifyStatic, pluginOptions);
  fastify.log.info(`Serving static files from ${pluginOptions.root}`);
};

export default fp(staticFilesPlugin, {
  name: 'apikit-static-files',
  dependencies: ['@fastify/static'],
});
