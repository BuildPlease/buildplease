import { makeRequestMetadataFixture } from '@src-node-test/request/request-metadata';
import { withTestRequestScope } from '@src-node-test/request/request-scope';
import { describe, expect, it, vi } from 'vitest';

import { RequestScope } from '@/request/request-scope';

describe('RequestScope', () => {
  it('exposes request metadata inside lifecycle', () => {
    const metadata = makeRequestMetadataFixture({ requestId: 'request-1', locale: 'sk' });

    RequestScope.run({ metadata: metadata }, () => {
      expect(RequestScope.metadata).toBe(metadata);
      expect(RequestScope.requestId).toBe('request-1');
      expect(RequestScope.locale).toBe('sk');
    });
  });

  it('runs callbacks in the public test request scope with metadata overrides', () => {
    withTestRequestScope(
      () => {
        expect(RequestScope.requestId).toBe('fixture-request');
        expect(RequestScope.locale).toBe('sk');
      },
      { requestId: 'fixture-request', locale: 'sk' },
    );
  });

  it('shares request state across separately evaluated runtime modules', async () => {
    const firstRuntime = await import('@/request/request-scope');

    vi.resetModules();

    const secondRuntime = await import('@/request/request-scope');
    const metadata = makeRequestMetadataFixture({ requestId: 'shared-request' });

    firstRuntime.RequestScope.run({ metadata: metadata }, () => {
      expect(secondRuntime.RequestScope.requestId).toBe('shared-request');
    });
  });

  it('rejects access outside request lifecycle', () => {
    expect(() => RequestScope.metadata).toThrow(
      '[RequestScope] Attempted to access `metadata` outside of request lifecycle.',
    );
  });
});
