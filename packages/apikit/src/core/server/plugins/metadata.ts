import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

import { ignoreErrorAsync, isNullOrEmpty } from '@nidavellirx/meowv-core';

import type { RequestMetadata } from '#/request';
import type { ServerPluginOptions } from '#/server';

const requestMetadataPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const logger = options.loggerController;

  // MARK: - onRequest
  fastify.addHook('onRequest', async (request) => {
    const metadata: RequestMetadata = {
      requestId: request.id,
      method: request.method,
      url: request.url,
      protocol: request.protocol,
      query: request.query,
      params: request.params,
      ip: !isNullOrEmpty(request.ip) ? request.ip : (request.ips?.[0] ?? request.ip),
      locale: request.headers['accept-language'],
      headers: request.headers,
    };

    request.metadata = metadata;

    await ignoreErrorAsync(async () => {
      logger.info('Incoming Request', { metadata: request.metadata });
    });
  });

  // MARK: - onResponse
  fastify.addHook('onResponse', async (request, reply) => {
    await ignoreErrorAsync(async () => {
      logger.info('Sending Response', {
        metadata: {
          requestId: request.metadata.requestId,
        },
        content: {
          elapsedTime: reply.elapsedTime,
          statusCode: reply.statusCode,
        },
      });
    });
  });
};

export default fp(requestMetadataPlugin, {
  name: 'apikit-request-metadata',
});
