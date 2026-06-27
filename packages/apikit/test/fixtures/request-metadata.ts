import type { RequestMetadata } from '@/request/request-metadata';

export function makeTestRequestMetadata(overrides: Partial<RequestMetadata> = {}): RequestMetadata {
  return {
    requestId: 'test-request-id',
    method: 'GET',
    url: '/test',
    protocol: 'http',
    query: {},
    params: {},
    ip: '127.0.0.1',
    headers: {},
    locale: 'en',
    ...overrides,
  };
}
