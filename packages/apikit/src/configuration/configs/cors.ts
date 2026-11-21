import { type InferConfiguration, defineConfiguration, field } from '@buildplease/core/node';
import type { FastifyCorsOptions } from '@fastify/cors';
import { ApiKitDefaults } from '@src-internal/configuration';

export type CorsOptions = FastifyCorsOptions;

export const CorsConfiguration = defineConfiguration('apikit.cors', {
  enabled: field.boolean().default(ApiKitDefaults.cors.enabled),
  allowAllOrigins: field.boolean().default(ApiKitDefaults.cors.allowAllOrigins),
  includeWwwSubdomain: field.boolean().default(ApiKitDefaults.cors.includeWwwSubdomain),
  options: field.custom<CorsOptions>().default({}).map(resolveCorsOptions),
});

export type CorsConfig = InferConfiguration<typeof CorsConfiguration>;

function resolveCorsOptions(options: CorsOptions): CorsOptions {
  return {
    ...ApiKitDefaults.cors.options,
    ...options,
  };
}
