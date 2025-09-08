import type z from 'zod';

import en from './en.js';
import sk from './sk.js';
import cs from './cs.js';

export { default as en } from './en.js';
export { default as sk } from './sk.js';
export { default as cs } from './cs.js';

export const locales: Record<string, () => { localeError: z.core.$ZodErrorMap }> = {
  en,
  sk,
  cs,
};
