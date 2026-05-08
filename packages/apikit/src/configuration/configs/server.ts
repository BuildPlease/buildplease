import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type TrustProxy = boolean | string | number | string[] | ((address: string, hop: number) => boolean);

export const ServerConfiguration = defineConfiguration('apikit.server', {
  identifier: field.string(),
  host: field.string(),
  port: field.number(),
  trustProxy: field.custom<TrustProxy>().default(false),
});

export type ServerConfig = InferConfiguration<typeof ServerConfiguration>;
