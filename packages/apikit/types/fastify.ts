import type { RequestMetadata } from '@/request';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: RequestMetadata;
  }
}

export {};
