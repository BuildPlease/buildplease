import validator from 'validator';
import type { NumberFormat } from 'libphonenumber-js';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { injectable } from 'inversify';

import { ApiErrorCodes } from '$/error';

export interface NormalizationController {
  normalizeEmail(email: string): string;
  normalizePhoneToE164(phoneNumber: string): string;
  normalizePhoneToInternational(phoneNumber: string): string;
  normalizePhoneToNational(phoneNumber: string): string;
}

@injectable()
export class NormalizationControllerImpl implements NormalizationController {
  normalizeEmail(email: string): string {
    const normalizedEmail = validator.normalizeEmail(email, {
      all_lowercase: false,
      gmail_lowercase: true,
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      gmail_convert_googlemaildotcom: true,
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: true,
      icloud_lowercase: true,
      icloud_remove_subaddress: true,
    });
    if (!normalizedEmail) {
      throw ApiErrorCodes.Validation.INVALID_EMAIL_FORMAT();
    }
    return normalizedEmail as string;
  }

  normalizePhoneToE164(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('E.164' as NumberFormat);
    } catch {
      throw ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT();
    }
  }

  normalizePhoneToInternational(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('INTERNATIONAL' as NumberFormat);
    } catch {
      throw ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT();
    }
  }

  normalizePhoneToNational(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('NATIONAL' as NumberFormat).replace(/[^\d]/g, '');
    } catch {
      throw ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT();
    }
  }
}
