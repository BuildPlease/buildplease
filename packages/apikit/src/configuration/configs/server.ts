import { ApiKitDefaults } from '@src-internal/configuration';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type TrustProxy = boolean | string | number | string[] | ((address: string, hop: number) => boolean);

export const ServerConfiguration = defineConfiguration('apikit.server', {
  identifier: field.string(),
  debug: field.boolean().default(ApiKitDefaults.server.debug),
  host: field.string(),
  port: field.number(),
  trustProxy: field.custom<TrustProxy>().default(ApiKitDefaults.server.trustProxy),
});

export type ServerConfig = InferConfiguration<typeof ServerConfiguration>;
