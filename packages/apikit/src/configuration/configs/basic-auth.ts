import { type InferConfiguration, defineConfiguration, field } from '@buildplease/core/node';
import type { FastifyBasicAuthOptions } from '@fastify/basic-auth';
import { ApiKitDefaults } from '@src-internal/configuration';

export type BasicAuthAuthenticate = FastifyBasicAuthOptions['authenticate'];

export const BasicAuthConfiguration = defineConfiguration('apikit.basic-auth', {
  enabled: field.boolean().default(ApiKitDefaults.basicAuth.enabled),
  authenticate: field.custom<BasicAuthAuthenticate>().default(ApiKitDefaults.basicAuth.authenticate),
  proxyMode: field.boolean().default(ApiKitDefaults.basicAuth.proxyMode),
  header: field.string().optional().default(ApiKitDefaults.basicAuth.header),
  strictCredentials: field.boolean().optional().default(ApiKitDefaults.basicAuth.strictCredentials),

  username: field.string().optional(),
  password: field.string().optional(),
});

export type BasicAuthConfig = InferConfiguration<typeof BasicAuthConfiguration>;
