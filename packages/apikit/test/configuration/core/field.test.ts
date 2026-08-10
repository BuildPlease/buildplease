import { describe, expect, it } from 'vitest';

import { field, isConfigurationField } from '@/configuration/core/field';

describe('field', () => {
  it('parses and trims strings', () => {
    expect(field.string().parse('  value  ', 'app.name')).toBe('value');
  });

  it('rejects empty strings', () => {
    expect(() => field.string().parse('   ', 'app.name')).toThrow('app.name must not be empty.');
  });

  it('parses numbers from strings', () => {
    expect(field.number().parse('42', 'server.port')).toBe(42);
  });

  it('parses booleans from strings', () => {
    expect(field.boolean().parse('true', 'feature.enabled')).toBe(true);
    expect(field.boolean().parse('FALSE', 'feature.enabled')).toBe(false);
  });

  it('supports optional values', () => {
    const optional = field.string().optional();

    expect(optional.required).toBe(false);
    expect(optional.parse(undefined, 'optional.value')).toBeUndefined();
    expect(optional.parse(null, 'optional.value')).toBeUndefined();
  });

  it('supports defaults', () => {
    const withDefault = field.number().default(10);

    expect(withDefault.required).toBe(false);
    expect(withDefault.hasDefault).toBe(true);
    expect(withDefault.defaultValue).toBe(10);
  });

  it('maps parsed values', () => {
    const mapped = field.string().map((value) => value.toUpperCase());

    expect(mapped.parse('sample', 'app.name')).toBe('SAMPLE');
  });

  it('marks configuration fields', () => {
    expect(isConfigurationField(field.string())).toBe(true);
    expect(isConfigurationField({})).toBe(false);
  });
});
