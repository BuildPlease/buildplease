import type { RequestMetadata } from '@nidavellirx/meowv-apikit';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: RequestMetadata;
  }
}
