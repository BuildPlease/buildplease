// validationHelpers.ts
import { z } from 'zod';

/**
 * Transforms a string or number input into a number.
 * Provides custom error messages for transformation failures.
 */
export const stringToNumber = z.preprocess(
  (arg) => {
    if (typeof arg === 'string' || typeof arg === 'number') {
      const parsedNumber = Number(arg);
      return isNaN(parsedNumber) ? undefined : parsedNumber;
    }
    return undefined;
  },
  z.number({
    required_error: 'A valid number is required.',
    invalid_type_error: 'Invalid number format.',
  }),
);

/**
 * Transforms a string input into a Date object.
 * Provides custom error messages for transformation failures.
 */
export const stringToDate = z.preprocess(
  (arg) => {
    if (typeof arg === 'string' || arg instanceof Date) {
      const parsedDate = new Date(arg);
      return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    return undefined;
  },
  z.date({
    required_error: 'A valid date is required.',
    invalid_type_error: 'Invalid date format.',
  }),
);

/**
 * Ensures that a string is not empty and doesn't consist solely of whitespace.
 */
export const nonEmptyString = z
  .string({ required_error: 'This field is required.' })
  .trim()
  .min(1, 'This field cannot be empty or consist solely of whitespace.');
