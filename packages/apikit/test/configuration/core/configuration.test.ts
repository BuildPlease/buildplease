import { describe, expect, it } from 'vitest';

import {
  defineConfiguration,
  isConfigurationBinding,
  isConfigurationContract,
} from '@/configuration/core/configuration';
import { field } from '@/configuration/core/field';

describe('defineConfiguration', () => {
  it('creates a contract with normalized key and schema', () => {
    const Configuration = defineConfiguration(' example.feature ', {
      name: field.string(),
    });

    expect(Configuration.key).toBe('example.feature');
    expect(isConfigurationContract(Configuration)).toBe(true);
  });

  it('rejects empty configuration keys', () => {
    expect(() => defineConfiguration('   ', { name: field.string() })).toThrow('Configuration key must not be empty.');
  });

  it('creates configuration bindings', () => {
    const Configuration = defineConfiguration('example.feature', {
      name: field.string(),
    });

    const binding = Configuration({ name: 'Project' });

    expect(binding.contract).toBe(Configuration);
    expect(binding.input).toEqual({ name: 'Project' });
    expect(isConfigurationBinding(binding)).toBe(true);
  });
});
