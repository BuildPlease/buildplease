import fastifyCors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit_@fastify/cors';

const corsPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const config = options.apikitController.cors;

  if (!config.enabled) return;

  await fastify.register(fastifyCors, {
    ...config.options,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.isDevelopment) return callback(null, origin);

      const origins = formatAllowedOrigins(config.allowedOrigins);
      if (origins.includes(origin)) return callback(null, origin);

      return callback(null, false);
    },
  });
};

function formatAllowedOrigins(domains: string | readonly string[] | undefined | null): string[] {
  if (!domains) return [];

  const list = Array.isArray(domains) ? domains : [domains];

  return list
    .map((domain) => {
      const { protocol, host } = new URL(domain);
      const primaryOrigin = `${protocol}//${host}`;
      const isHostname = /^[a-zA-Z][a-zA-Z0-9.-]*$/.test(host);

      if (!isHostname) return [primaryOrigin];

      const wwwHost = host.startsWith('www.') ? host : `www.${host}`;
      return [primaryOrigin, `${protocol}//${wwwHost}`];
    })
    .flat();
}

export default fp(corsPlugin, {
  name: pluginName,
});
