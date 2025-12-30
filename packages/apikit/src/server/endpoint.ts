import type { FastifyInstance, FastifyRequest, FastifySchema } from 'fastify';

import type { HttpMethod, HttpResponse } from '@/http';

export interface Endpoint {
  method: HttpMethod;
  url: string;
  schema(server: FastifyInstance): FastifySchema;
  handle: (request: FastifyRequest) => Promise<HttpResponse>;
}
