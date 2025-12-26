import '@fastify/cookie';
import '@fastify/static';
import '@fastify/view';
import 'fastify-ip';

import type { RequestMetadata } from '#/request';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: RequestMetadata;
  }
}

export {};
