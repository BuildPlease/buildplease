import type { HttpMetadata } from '@nidavellirx/meowv-apikit';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: HttpMetadata;
  }
}
