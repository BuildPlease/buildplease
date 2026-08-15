import type { FastifyStaticOptions } from '@fastify/static';
import { ApiKitDefaults } from '@internal/configuration';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type StaticFilesDotfilesMode = NonNullable<FastifyStaticOptions['dotfiles']>;

export const StaticFilesConfiguration = defineConfiguration('apikit.staticFiles', {
  enabled: field.boolean().default(ApiKitDefaults.staticFiles.enabled),
  publicDirectory: field.string().optional(),

  routePrefix: field.string().default(ApiKitDefaults.staticFiles.routePrefix),
  maxAge: field.number().default(ApiKitDefaults.staticFiles.maxAge),
  dotfiles: field.custom<StaticFilesDotfilesMode>().default(ApiKitDefaults.staticFiles.dotfiles),
  etag: field.boolean().default(ApiKitDefaults.staticFiles.etag),
  immutable: field.boolean().default(ApiKitDefaults.staticFiles.immutable),
  decorateReply: field.boolean().default(ApiKitDefaults.staticFiles.decorateReply),
  preCompressed: field.boolean().default(ApiKitDefaults.staticFiles.preCompressed),
});

export type StaticFilesConfig = InferConfiguration<typeof StaticFilesConfiguration>;
