import type { OptionalPartial } from '@nidavellirx/meowv-webkit';
import { z } from 'zod';

const stringSchema = z.object({
  stringMin1: z.string().min(1), // Min length 1
  stringMin2: z.string().min(2), // Min length 2
  stringMin5: z.string().min(5), // Min length 5

  stringMax1: z.string().max(1), // Max length 1
  stringMax2: z.string().max(2), // Max length 2
  stringMax5: z.string().max(5), // Max length 5

  regexLowercased: z.string().regex(/^[a-z]+$/), // Lowercase letters
  regexUppercased: z.string().regex(/^[A-Z]+$/), // Uppercase letters

  email: z.email(), // Email format
  url: z.url(), // URL format
});

const minDate = new Date('2000-01-01');
const maxDate = new Date('2030-01-01');
const dateSchema = z.object({
  // Simple Date
  date: z.date(),

  // Date with minimum allowed value
  dateMin: z.date().min(minDate),

  // Date with maximum allowed value
  dateMax: z.date().max(maxDate),

  // Date range with start and end
  dateRange: z.object({
    start: z.date().refine((date) => date >= minDate),
    end: z.date().refine((date) => date <= maxDate),
  }),

  // ISO Date format
  dateISO: z.iso.date(),
});

export const complexSchema = z.object({
  stringFields: stringSchema,
  dates: dateSchema,
});

export type ComplexData = z.output<typeof complexSchema>;
export type ComplexDto = OptionalPartial<ComplexData>;
