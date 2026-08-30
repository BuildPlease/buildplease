import * as CoreNode from '@src-node/index';
import * as CoreTest from '@src-test/index';
import { describe, expect, it } from 'vitest';

describe('Core Node public API', () => {
  it('does not expose selected-environment transport internals', () => {
    expect('BUILDPLEASE_ENVIRONMENT_VARIABLE' in CoreNode).toBe(false);
    expect('readSelectedEnvironmentName' in CoreNode).toBe(false);
    expect('BUILDPLEASE_ENVIRONMENT_VARIABLE' in CoreTest).toBe(false);
    expect('readSelectedEnvironmentName' in CoreTest).toBe(false);
    expect(CoreTest.withSelectedEnvironment).toBeTypeOf('function');
  });
});
