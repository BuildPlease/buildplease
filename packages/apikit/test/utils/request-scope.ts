import { makeTestRequestMetadata } from '@test/fixtures/request-metadata';

import { RequestScope } from '@/request/request-scope';

export function withTestRequestScope<T>(callback: () => T): T {
  return RequestScope.run(
    {
      metadata: makeTestRequestMetadata(),
    },
    callback,
  );
}
