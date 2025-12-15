import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().trim().min(1).max(15),
});

export type LoginDto = z.output<typeof loginSchema>;
