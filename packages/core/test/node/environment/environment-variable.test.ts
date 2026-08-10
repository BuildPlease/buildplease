import { optionalEnvironmentVariable, requiredEnvironmentVariable } from '@node/environment';
import { afterEach, describe, expect, it } from 'vitest';

const OPTIONAL_VARIABLE = 'TEST_OPTIONAL_ENVIRONMENT_VARIABLE';
const REQUIRED_VARIABLE = 'TEST_REQUIRED_ENVIRONMENT_VARIABLE';

afterEach(() => {
  delete process.env[OPTIONAL_VARIABLE];
  delete process.env[REQUIRED_VARIABLE];
});

describe('optionalEnvironmentVariable', () => {
  it('returns a trimmed environment variable', () => {
    process.env[OPTIONAL_VARIABLE] = '  value  ';

    expect(optionalEnvironmentVariable(OPTIONAL_VARIABLE)).toBe('value');
  });

  it('returns undefined when the environment variable is missing', () => {
    expect(optionalEnvironmentVariable(OPTIONAL_VARIABLE)).toBeUndefined();
  });

  it('returns undefined when the environment variable is blank', () => {
    process.env[OPTIONAL_VARIABLE] = '   ';

    expect(optionalEnvironmentVariable(OPTIONAL_VARIABLE)).toBeUndefined();
  });
});

describe('requiredEnvironmentVariable', () => {
  it('returns a trimmed environment variable', () => {
    process.env[REQUIRED_VARIABLE] = '  value  ';

    expect(requiredEnvironmentVariable(REQUIRED_VARIABLE)).toBe('value');
  });

  it('throws when the environment variable is missing', () => {
    expect(() => requiredEnvironmentVariable(REQUIRED_VARIABLE)).toThrow();
  });

  it('throws when the environment variable is blank', () => {
    process.env[REQUIRED_VARIABLE] = '   ';

    expect(() => requiredEnvironmentVariable(REQUIRED_VARIABLE)).toThrow();
  });
});
