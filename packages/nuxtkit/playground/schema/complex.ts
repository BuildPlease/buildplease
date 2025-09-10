import { z } from 'zod';

// String-related validations with min length constraints and other validations
const stringSchema = z.object({
  stringMin1: z.string().min(1), // Min length 1
  stringMin2: z.string().min(2), // Min length 2
  stringMin3: z.string().min(3), // Min length 3
  regexLowercased: z.string().regex(/^[a-z]+$/), // Lowercase letters
  regexUppercased: z.string().regex(/^[A-Z]+$/), // Uppercase letters
  email: z.email(), // Email format
  url: z.url(), // URL format
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // Date format (YYYY-MM-DD)
});

export const complexSchema = z.object({
  stringFields: stringSchema,
});

export type ComplexDto = z.output<typeof complexSchema>;
