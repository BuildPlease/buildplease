import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

import { ignoreError, isNullOrEmpty } from '@nidavellirx/meowv-core';

import type { RequestMetadata } from '#/request';
import type { ServerPluginOptions } from '#/server';

const requestMetadataPlugin: FastifyPluginAsync<ServerPluginOptions> = async (fastify, options) => {
  const logger = options.loggerController;

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
  });

  // MARK: - Log Incoming Request
  fastify.addHook('onRequest', async (request) => {
    ignoreError(async () => {
      logger.info('Incoming request', {
        metadata: request.metadata,
      });
    });
  });

  // MARK: - Log Outgoing Request
  fastify.addHook('onResponse', async (request, reply) => {
    ignoreError(async () => {
      logger.info('Sending response', {
        metadata: {
          requestId: request.metadata.reqId,
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
