import { z } from 'zod';

export const loginSchema = z.object({
  name: z.string().min(1).max(15),
  email: z.string().email(),
});

export type LoginDto = z.output<typeof loginSchema>;
