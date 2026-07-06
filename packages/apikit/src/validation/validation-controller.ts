import { injectable } from 'inversify';
import { type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import validator from 'validator';

import { ApiErrorCodes, ApiErrorFactory } from '@/error';

export interface ValidationController {
  isValidEmail(email?: string | null): boolean;
  isValidEmailThrowing(email?: string | null): void;
  isValidPhoneNumber(phoneNumber?: string | null, countryCode?: string): boolean;
  isValidPhoneNumberThrowing(phoneNumber?: string | null, countryCode?: string): void;
  isValidCode(code?: string | null): boolean;
  isValidCodeThrowing(code?: string | null): void;
  isEmail(input?: string | null): boolean;
  isEmailThrowing(input?: string | null): void;
  isPhoneNumber(input?: string | null): boolean;
  isPhoneNumberThrowing(input?: string | null): void;
  isNumber(input?: any): boolean;
  isNumberThrowing(input?: any): void;
  isString(input?: string | null): boolean;
  isStringThrowing(input?: string | null): void;
  isEmptyString(input?: string | null): boolean;
  isEmptyStringThrowing(input?: string | null): void;
  isNonEmptyString(input?: string | null): boolean;
  isNonEmptyStringThrowing(input?: string | null): string;
  isValidDate(dateString?: string | null): boolean;
  isValidDateThrowing(dateString?: string | null): Date;
}

@injectable()
export class ValidationControllerImpl implements ValidationController {
  isValidEmail(email?: string | null): boolean {
    return !!email && validator.isEmail(email);
  }

  isValidEmailThrowing(email?: string | null): void {
    if (!this.isValidEmail(email)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_EMAIL_FORMAT.message);
    }
  }

  isValidPhoneNumber(phoneNumber?: string | null, countryCode?: string): boolean {
    if (!phoneNumber) return false;

    let parsedPhoneNumber;

    if (countryCode) {
      parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, countryCode as CountryCode);
    } else {
      parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber);
    }

    return !!parsedPhoneNumber?.isValid();
  }

  isValidPhoneNumberThrowing(phoneNumber?: string | null, countryCode?: string): void {
    if (!this.isValidPhoneNumber(phoneNumber, countryCode)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT.message);
    }
  }

  isValidCode(code?: string | null): boolean {
    return !!code && /^\d{6}$/.test(code);
  }

  isValidCodeThrowing(code?: string | null): void {
    if (!this.isValidCode(code)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_FORMAT.message, {
        details: 'Input is not a valid code',
      });
    }
  }

  isEmail(input?: string | null): boolean {
    return !!input && validator.isEmail(input);
  }

  isEmailThrowing(input?: string | null): void {
    if (!this.isEmail(input)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_EMAIL_FORMAT.message);
    }
  }

  isPhoneNumber(input?: string | null): boolean {
    return !!input && validator.isMobilePhone(input);
  }

  isPhoneNumberThrowing(input?: string | null): void {
    if (!this.isPhoneNumber(input)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PHONE_NUMBER_FORMAT.message);
    }
  }

  isNumber(input?: any): boolean {
    return typeof input === 'number' && !isNaN(input);
  }

  isNumberThrowing(input?: any): void {
    if (!this.isNumber(input)) {
      const details = 'Input is not a valid number';
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PROPERTIES.message, { details: details });
    }
  }

  isString(input?: string | null): boolean {
    return typeof input === 'string';
  }

  isStringThrowing(input?: string | null): void {
    if (!this.isString(input)) {
      const details = 'Input is not a valid string';
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PROPERTIES.message, { details: details });
    }
  }

  isEmptyString(input?: string | null): boolean {
    return input == null || input.trim() === '';
  }

  isEmptyStringThrowing(input?: string | null): void {
    if (!this.isEmptyString(input)) {
      const details = 'Input is not an empty string';
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PROPERTIES.message, { details: details });
    }
  }

  isNonEmptyString(input?: string | null): boolean {
    return this.isString(input) && !this.isEmptyString(input);
  }

  isNonEmptyStringThrowing(input?: string | null): string {
    const validatedInput = input;

    if (typeof validatedInput !== 'string' || validatedInput.trim() === '') {
      const details = 'Input is empty or not a string';
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_PROPERTIES.message, { details: details });
    }

    return validatedInput;
  }

  isValidDate(dateString?: string | null): boolean {
    if (!dateString) return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  isValidDateThrowing(dateString?: string | null): Date {
    if (!this.isValidDate(dateString)) {
      throw ApiErrorFactory.make(ApiErrorCodes.Validation.INVALID_DATE_FORMAT.message);
    }

    return new Date(dateString!);
  }
}
