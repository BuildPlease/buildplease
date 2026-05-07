import type { FastifyCorsOptions } from '@fastify/cors';
import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type CorsOptions = Omit<FastifyCorsOptions, 'origin'>;
export type CorsAllowedOrigins = string | readonly string[];

export const CorsConfiguration = defineConfiguration({
  enabled: field.boolean().default(ApiKitDefaults.cors.enabled),

  isDevelopment: field.boolean().default(ApiKitDefaults.cors.isDevelopment),
  allowedOrigins: field.custom<CorsAllowedOrigins>().default(ApiKitDefaults.cors.allowedOrigins),

  options: field.custom<CorsOptions>().default(ApiKitDefaults.cors.options as CorsOptions),
});

export type CorsConfig = InferConfiguration<typeof CorsConfiguration>;
