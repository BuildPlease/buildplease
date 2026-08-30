import {
  BUILDPLEASE_ENVIRONMENT_VARIABLE,
  readSelectedEnvironmentName,
} from '@src-internal/environment-configuration/selection';
import { afterEach, describe, expect, it } from 'vitest';

describe('BuildPlease environment selection', () => {
  afterEach(() => {
    delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
  });

  it('reads and normalizes the selected environment name', () => {
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = ' test ';

    expect(readSelectedEnvironmentName()).toBe('test');
  });

  it('requires explicit environment selection', () => {
    expect(() => readSelectedEnvironmentName()).toThrow('BuildPlease environment is not selected.');
  });
});
