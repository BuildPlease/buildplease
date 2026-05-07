import '@fastify/basic-auth';
import '@fastify/cookie';
import '@fastify/cors';
import 'fastify-ip';
import 'fastify-metrics';
import '@fastify/multipart';
import '@fastify/static';
import '@fastify/view';

import type { RequestMetadata } from '@/request';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: RequestMetadata;
  }
}

export {};
