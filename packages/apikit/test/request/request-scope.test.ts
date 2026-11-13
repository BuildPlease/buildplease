import { makeRequestMetadataFixture } from '@src-testing/request/request-metadata';
import { describe, expect, it } from 'vitest';

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

  it('preserves request metadata across async work', async () => {
    const metadata = makeRequestMetadataFixture({ requestId: 'request-async' });

    await RequestScope.run({ metadata: metadata }, async () => {
      await Promise.resolve();
      expect(RequestScope.requestId).toBe('request-async');
    });
  });

  it('isolates concurrent request scopes', async () => {
    const firstGate = Promise.withResolvers<void>();

    const first = RequestScope.run(
      { metadata: makeRequestMetadataFixture({ requestId: 'request-1', locale: 'sk' }) },
      async () => {
        await firstGate.promise;
        expect(RequestScope.requestId).toBe('request-1');
        expect(RequestScope.locale).toBe('sk');
      },
    );

    const second = RequestScope.run(
      { metadata: makeRequestMetadataFixture({ requestId: 'request-2', locale: 'en' }) },
      async () => {
        expect(RequestScope.requestId).toBe('request-2');
        expect(RequestScope.locale).toBe('en');
        firstGate.resolve();
      },
    );

    await Promise.all([first, second]);
  });

  it('rejects access outside request lifecycle', () => {
    expect(() => RequestScope.metadata).toThrow(
      '[RequestScope] Attempted to access `metadata` outside of request lifecycle.',
    );
  });
});
