import { injectable } from 'inversify';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import validator from 'validator';

import { ApiErrorCodes, ApiErrorFactory } from '@/error';

export interface NormalizationController {
  normalizeEmail(email: string): string;
  normalizePhoneToE164(phoneNumber: string): string;
  normalizePhoneToInternational(phoneNumber: string): string;
  normalizePhoneToNational(phoneNumber: string): string;
}

@injectable()
export class NormalizationControllerImpl implements NormalizationController {
  normalizeEmail(email: string): string {
    const value = email.trim();

    if (!validator.isEmail(value)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_EMAIL_FORMAT.message);
    }

    const normalizedEmail = validator.normalizeEmail(value, {
      all_lowercase: true,
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
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_EMAIL_FORMAT.message);
    }

    return normalizedEmail;
  }

  normalizePhoneToE164(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('E.164');
    } catch {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT.message);
    }
  }

  normalizePhoneToInternational(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('INTERNATIONAL');
    } catch {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT.message);
    }
  }

  normalizePhoneToNational(phoneNumber: string): string {
    try {
      const number = parsePhoneNumberWithError(phoneNumber);
      return number.format('NATIONAL').replace(/[^\d]/g, '');
    } catch {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT.message);
    }
  }
}
