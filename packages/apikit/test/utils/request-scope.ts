import { RequestScope } from '@/request/request-scope';

import { makeTestRequestMetadata } from '../fixtures/request-metadata';

export function withTestRequestScope<T>(callback: () => T): T {
  return RequestScope.run(
    {
      metadata: makeTestRequestMetadata(),
    },
    callback,
  );
}
