import 'fastify';

import type { HttpMetadata } from '$/http';

declare module 'fastify' {
  interface FastifyRequest {
    metadata: HttpMetadata;
  }
}
