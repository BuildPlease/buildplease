import { z } from 'zod';

export const userSchema = z.object({
  firstName: z.string().min(3).startsWith('u').endsWith('r'),
  lastName: z.string().min(1),
  birthDate: z.coerce.date().min(new Date('2025-06-01')).max(new Date('2026-01-01')),
  email: z
    .string()
    .email()
    .refine(() => false, { params: { i18n: 'myCustomError' } }),
  preferredColor: z.string().refine(() => false, {
    params: {
      i18n: {
        key: 'myCustomErrorWithInterpolation',
        values: { first: 'colors.red', second: 'colors.green' },
      },
    },
  }),
});

export type UserDto = z.output<typeof userSchema>;
