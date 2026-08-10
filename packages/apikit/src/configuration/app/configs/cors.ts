import type { FastifyCorsOptions } from '@fastify/cors';
import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type CorsOptions = FastifyCorsOptions;

export const CorsConfiguration = defineConfiguration('apikit.cors', {
  enabled: field.boolean().default(ApiKitAppDefaults.cors.enabled),
  allowAllOrigins: field.boolean().default(ApiKitAppDefaults.cors.allowAllOrigins),
  includeWwwSubdomain: field.boolean().default(ApiKitAppDefaults.cors.includeWwwSubdomain),
  options: field.custom<CorsOptions>().default({}).map(resolveCorsOptions),
});

export type CorsConfig = InferConfiguration<typeof CorsConfiguration>;

function resolveCorsOptions(options: CorsOptions): CorsOptions {
  return {
    ...ApiKitAppDefaults.cors.options,
    ...options,
  };
}
