import { withTestRequestScope } from '@src-node-test/request/request-scope';
import { describe, expect, it } from 'vitest';

import { ApiError } from '@/error/api-error';
import { NormalizationControllerImpl } from '@/normalization/normalization-controller';

describe('NormalizationController', () => {
  const controller = new NormalizationControllerImpl();

  it('normalizes emails', () => {
    expect(controller.normalizeEmail(' First.Last+tag@gmail.com ')).toBe('firstlast@gmail.com');
  });

  it('rejects invalid emails', () => {
    withTestRequestScope(() => {
      let error: unknown;

      try {
        controller.normalizeEmail('invalid');
      } catch (caught) {
        error = caught;
      }

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        code: 'INVALID_EMAIL_FORMAT',
        statusCode: 400,
      });
    });
  });

  it('formats phone numbers', () => {
    expect(controller.normalizePhoneToE164('+421 903 123 456')).toBe('+421903123456');
    expect(controller.normalizePhoneToNational('+421 903 123 456')).toBe('0903123456');
  });
});
