import type { RequestMetadata } from '@/request/request-metadata';

import { makeRequestMetadataFixture } from './request-metadata';

export function makeRequestScopeDataFixture(metadata: Partial<RequestMetadata> = {}) {
  return {
    metadata: makeRequestMetadataFixture(metadata),
  };
}
