import { z } from 'zod';

export const OverloadSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  age: z.coerce.number().min(18),
  terms: z.boolean().refine((v) => v, { message: 'Must accept terms' }),
});

export type OverloadDto = z.infer<typeof OverloadSchema>;
