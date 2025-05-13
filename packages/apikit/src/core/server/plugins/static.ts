import path from 'node:path';

import fp from 'fastify-plugin';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';

import { resolvePath, ensureDirectory } from '#/utils';
import type { ServerPluginOptions } from '#/server';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.staticFile;

  // MARK: - Skip if not configured
  if (!config) {
    fastify.log.info('[static] No static file config provided — skipping static plugin');
    return;
  }

  // MARK: - Resolve and ensure path
  const resolvedPath = path.isAbsolute(config.rootPath)
    ? config.rootPath
    : resolvePath(process.cwd(), config.rootPath);
  const root = ensureDirectory(resolvedPath);

  // MARK: - Options with defaults
  const {
    routePrefix = '/',
    maxAge = 3600,
    enabled = true,
    dotfiles = 'ignore',
    decorateReply = true,
    immutable = true,
    etag = true,
    preCompressed = false,
  } = config;

  const pluginOptions: FastifyStaticOptions = {
    root: root,
    prefix: routePrefix,
    maxAge: maxAge,
    serve: enabled,
    dotfiles: dotfiles,
    decorateReply: decorateReply,
    immutable: immutable,
    etag: etag,
    preCompressed: preCompressed,
  };

  await fastify.register(fastifyStatic, pluginOptions);
  fastify.log.info(`Serving static files from ${pluginOptions.root}`);
};

export default fp(staticFilesPlugin, {
  name: 'apikit-@fastify/static',
});
