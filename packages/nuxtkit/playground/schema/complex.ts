import { z } from 'zod';

export const ComplexSchema = z.object({
  // basic strings
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  website: z.string().url().optional(),

  // numbers
  age: z.number().int().gte(0).lte(120),
  rating: z.number().min(0).max(5).default(0),

  // dates
  birthdate: z.coerce.date().max(new Date()),

  // enums + literals
  role: z.enum(['user', 'admin', 'editor']),
  status: z.union([z.literal('active'), z.literal('inactive')]),

  // arrays
  tags: z.array(z.string().min(1)).min(1).max(5),
  scores: z.array(z.number()).nonempty(),

  // nested objects
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string().regex(/^\d{5}$/),
  }),

  // unions
  payment: z.union([
    z.object({ type: z.literal('card'), cardNumber: z.string().length(16) }),
    z.object({ type: z.literal('paypal'), email: z.string().email() }),
  ]),

  // optionals + nullables
  bio: z.string().max(200).nullable().optional(),

  // refinements
  security: z
    .object({
      password: z.string().min(8),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { path: ['confirm'] }),
});

export type ComplexDto = z.infer<typeof ComplexSchema>;
