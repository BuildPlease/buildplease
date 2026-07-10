import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type BasicAuthAuthenticate = FastifyBasicAuthOptions['authenticate'];

export const BasicAuthConfiguration = defineConfiguration('apikit.basic-auth', {
  enabled: field.boolean().default(ApiKitAppDefaults.basicAuth.enabled),
  authenticate: field.custom<BasicAuthAuthenticate>().default(ApiKitAppDefaults.basicAuth.authenticate),
  proxyMode: field.boolean().default(ApiKitAppDefaults.basicAuth.proxyMode),
  header: field.string().optional().default(ApiKitAppDefaults.basicAuth.header),
  strictCredentials: field.boolean().optional().default(ApiKitAppDefaults.basicAuth.strictCredentials),

  username: field.string().optional(),
  password: field.string().optional(),
});

export type BasicAuthConfig = InferConfiguration<typeof BasicAuthConfiguration>;
