import { makeTestRequestMetadata } from '@test/fixtures/request-metadata';
import { describe, expect, it } from 'vitest';

import { RequestScope } from '@/request/request-scope';

describe('RequestScope', () => {
  it('exposes request metadata inside lifecycle', () => {
    const metadata = makeTestRequestMetadata({ requestId: 'request-1', locale: 'sk' });

    RequestScope.run({ metadata }, () => {
      expect(RequestScope.metadata).toBe(metadata);
      expect(RequestScope.requestId).toBe('request-1');
      expect(RequestScope.locale).toBe('sk');
    });
  });

  it('rejects access outside request lifecycle', () => {
    expect(() => RequestScope.metadata).toThrow(
      '[RequestScope] Attempted to access `metadata` outside of request lifecycle.',
    );
  });
});
