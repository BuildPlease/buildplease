import type { FastifyCorsOptions } from '@fastify/cors';
import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type CorsOptions = FastifyCorsOptions;

export const CorsConfiguration = defineConfiguration('apikit.cors', {
  enabled: field.boolean().default(ApiKitDefaults.cors.enabled),
  allowAllOrigins: field.boolean().default(ApiKitDefaults.cors.allowAllOrigins),
  includeWwwSubdomain: field.boolean().default(ApiKitDefaults.cors.includeWwwSubdomain),
  options: field.custom<CorsOptions>().default(ApiKitDefaults.cors.options),
});

export type CorsConfig = InferConfiguration<typeof CorsConfiguration>;
