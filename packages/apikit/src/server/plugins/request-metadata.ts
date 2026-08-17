import { isNullOrEmpty } from '@buildplease/core';
import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { HttpHeaders } from '@/http';
import type { RequestMetadata } from '@/request';
import type { ServerPluginOptions } from '@/server';

const pluginName = 'apikit-request-metadata';

const requestMetadataPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const i18n = options.i18nController;

  fastify.addHook('onRequest', async (request) => {
    const metadata: RequestMetadata = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      protocol: request.protocol,
      query: request.query,
      params: request.params,
      ip: !isNullOrEmpty(request.ip) ? request.ip : (request.ips?.[0] ?? request.ip),
      locale: i18n.parseLocale(request.headers[HttpHeaders.acceptLanguage]),
      headers: request.headers,
    };

    request.metadata = metadata;
  });
};

export default fp(requestMetadataPlugin, {
  name: pluginName,
});
