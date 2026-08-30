import { makeRequestMetadataFixture } from '@src-test/request/request-metadata';

import type { RequestMetadata } from '@/request/request-metadata';
import { RequestScope } from '@/request/request-scope';

export function withTestRequestScope<T>(callback: () => T, metadata: Partial<RequestMetadata> = {}): T {
  return RequestScope.run(
    {
      metadata: makeRequestMetadataFixture(metadata),
    },
    callback,
  );
}
