import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type BasicAuthOptions = Omit<FastifyBasicAuthOptions, 'validate' | 'authenticate'>;

export const BasicAuthConfiguration = defineConfiguration({
  enabled: field.boolean().default(ApiKitDefaults.basicAuth.enabled),

  username: field.string().optional(),
  password: field.string().optional(),

  authenticate: field.boolean().default(ApiKitDefaults.basicAuth.authenticate),
  realm: field.string().default(ApiKitDefaults.basicAuth.realm),

  options: field.custom<BasicAuthOptions>().default(ApiKitDefaults.basicAuth.options),
});

export type BasicAuthConfig = InferConfiguration<typeof BasicAuthConfiguration>;
