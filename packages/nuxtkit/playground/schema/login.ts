import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(15),
});

export type LoginDto = z.output<typeof loginSchema>;
