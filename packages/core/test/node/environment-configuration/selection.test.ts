import {
  BUILDPLEASE_ENVIRONMENT_VARIABLE,
  readSelectedEnvironmentName,
} from '@internal/node/environment-configuration/selection';
import { afterEach, describe, expect, it } from 'vitest';

describe('BuildPlease environment selection', () => {
  afterEach(() => {
    delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
  });

  it('reads the selected environment name unchanged', () => {
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = '-test';

    expect(readSelectedEnvironmentName()).toBe('-test');
  });

  it('requires explicit environment selection', () => {
    expect(() => readSelectedEnvironmentName()).toThrow('Environment is not selected.');
  });

  it('rejects a multi-word selected environment name', () => {
    process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE] = 'my test';

    expect(() => readSelectedEnvironmentName()).toThrow(
      'Environment name must be a non-empty string without whitespace.',
    );
  });
});
