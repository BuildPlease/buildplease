import path from 'node:path';

import fp from 'fastify-plugin';
import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import type { FastifyPluginAsync } from 'fastify';
import { resolvePath, ensureDirectory } from '@nidavellirx/meowv-core/node';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit_@fastify/static';

const staticFilesPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.staticFiles;

  // MARK: - Skip if not configured
  if (!config) {
    fastify.log.info(`[${pluginName}] No static file config provided — skipping`);
    return;
  }

  // MARK: - Resolve and ensure path
  const rootPath = config.rootPath;
  const resolvedPath = path.isAbsolute(rootPath) ? rootPath : resolvePath(process.cwd(), rootPath);
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
  fastify.log.info(`Serving static files from ${root}`);
};

export default fp(staticFilesPlugin, {
  name: pluginName,
});
