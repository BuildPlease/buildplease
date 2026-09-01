import * as ApiKitTest from '@src-testing/index';
import { describe, expect, it } from 'vitest';

describe('ApiKit testing public API', () => {
  it('exports reusable request testing utilities', () => {
    expect(ApiKitTest.makeRequestMetadataFixture).toBeTypeOf('function');
    expect(ApiKitTest.withTestRequestScope).toBeTypeOf('function');
  });
});
