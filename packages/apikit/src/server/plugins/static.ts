import path from 'node:path';

import fastifyStatic, { type FastifyStaticOptions } from '@fastify/static';
import { ensureDirectory, resolvePath } from '@meawkit/core/node';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

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

  const pluginOptions: FastifyStaticOptions = {
    root: root,
    prefix: config.routePrefix,
    maxAge: config.maxAge,
    serve: config.enabled,
    dotfiles: config.dotfiles,
    decorateReply: config.decorateReply,
    immutable: config.immutable,
    etag: config.etag,
    preCompressed: config.preCompressed,
  };

  await fastify.register(fastifyStatic, pluginOptions);
  fastify.log.info(`Serving static files from ${root}`);
};

export default fp(staticFilesPlugin, {
  name: pluginName,
});
