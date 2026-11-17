import { APIKIT_ENVIRONMENT_VARIABLE, readSelectedEnvironmentName } from '@src-internal/configuration/selection';
import { afterEach, describe, expect, it } from 'vitest';

describe('ApiKit environment selection', () => {
  afterEach(() => {
    delete process.env[APIKIT_ENVIRONMENT_VARIABLE];
  });

  it('reads the selected environment name unchanged', () => {
    process.env[APIKIT_ENVIRONMENT_VARIABLE] = '-test';

    expect(readSelectedEnvironmentName()).toBe('-test');
  });

  it('requires explicit environment selection', () => {
    expect(() => readSelectedEnvironmentName()).toThrow('Environment is not selected.');
  });

  it('rejects a multi-word selected environment name', () => {
    process.env[APIKIT_ENVIRONMENT_VARIABLE] = 'my test';

    expect(() => readSelectedEnvironmentName()).toThrow(
      'Environment name must be a non-empty string without whitespace.',
    );
  });
});
