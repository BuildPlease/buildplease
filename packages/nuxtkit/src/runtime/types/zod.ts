import type z from 'zod';

export type ZodLocaleConfig = Parameters<typeof z.config>[0];
export type ZodLocaleFactory = () => ZodLocaleConfig;
