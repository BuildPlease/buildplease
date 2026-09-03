import {
  BUILDPLEASE_ENVIRONMENT_VARIABLE,
  readSelectedEnvironmentName,
} from '@internal/node/environment-configuration/selection';
import { withSelectedEnvironment } from '@src-testing/selected-environment';
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('withSelectedEnvironment', () => {
  afterEach(() => {
    delete process.env[BUILDPLEASE_ENVIRONMENT_VARIABLE];
  });

  it('sets the selected environment during the callback', () => {
    const selected = withSelectedEnvironment('test', () => readSelectedEnvironmentName());

    expect(selected).toBe('test');
  });

  it('restores a missing previous value', () => {
    withSelectedEnvironment('test', () => undefined);

    expect(() => readSelectedEnvironmentName()).toThrow('Environment is not selected.');
  });

  it('restores an existing previous value', () => {
    withSelectedEnvironment('existing', () => {
      withSelectedEnvironment('test', () => {
        expect(readSelectedEnvironmentName()).toBe('test');
      });

      expect(readSelectedEnvironmentName()).toBe('existing');
    });
  });

  it('restores the previous value after the callback throws', () => {
    expect(() =>
      withSelectedEnvironment('test', () => {
        throw new Error('callback failed');
      }),
    ).toThrow('callback failed');

    expect(() => readSelectedEnvironmentName()).toThrow('Environment is not selected.');
  });

  it('keeps the environment selected for an asynchronous callback', async () => {
    await withSelectedEnvironment('test', async () => {
      await Promise.resolve();
      expect(readSelectedEnvironmentName()).toBe('test');
    });

    expect(() => readSelectedEnvironmentName()).toThrow('Environment is not selected.');
  });

  it('rejects invalid environment names before running the callback', () => {
    const run = vi.fn();

    expect(() => withSelectedEnvironment(' test ', run)).toThrow(
      'Environment name must be a non-empty string without whitespace.',
    );
    expect(run).not.toHaveBeenCalled();
  });
});
