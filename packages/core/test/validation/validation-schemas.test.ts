import { describe, expect, it } from 'vitest';

import { DateTime, ObjectId } from '@/model';
import { ValidationSchemas } from '@/validation';

describe('ValidationSchemas', () => {
  describe('UUID', () => {
    it('accepts UUID values', () => {
      const result = ValidationSchemas.UUID.parse('550e8400-e29b-41d4-a716-446655440000');

      expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('rejects non-UUID values', () => {
      expect(() => ValidationSchemas.UUID.parse('not-a-uuid')).toThrow();
    });
  });

  describe('DateTime', () => {
    it('converts ISO date-time strings to DateTime', () => {
      const result = ValidationSchemas.DateTime.parse('2026-07-28T12:34:56.000Z');

      expect(result).toBeInstanceOf(DateTime);
      expect(result.getTime()).toBe(new Date('2026-07-28T12:34:56.000Z').getTime());
    });

    it('rejects invalid date-time strings before constructing DateTime', () => {
      expect(() => ValidationSchemas.DateTime.parse('invalid')).toThrow();
    });
  });

  describe('ObjectId', () => {
    it('converts non-empty strings to ObjectId', () => {
      const result = ValidationSchemas.ObjectId.parse('  example-id  ');

      expect(result).toBeInstanceOf(ObjectId);
      expect(result.value).toBe('example-id');
    });

    it('rejects empty identifiers', () => {
      expect(() => ValidationSchemas.ObjectId.parse('   ')).toThrow();
    });
  });
});
