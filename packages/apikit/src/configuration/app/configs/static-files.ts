import type { FastifyStaticOptions } from '@fastify/static';
import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export type StaticFilesDotfilesMode = NonNullable<FastifyStaticOptions['dotfiles']>;

export const StaticFilesConfiguration = defineConfiguration('apikit.staticFiles', {
  enabled: field.boolean().default(ApiKitAppDefaults.staticFiles.enabled),
  publicDirectory: field.string().optional(),

  routePrefix: field.string().default(ApiKitAppDefaults.staticFiles.routePrefix),
  maxAge: field.number().default(ApiKitAppDefaults.staticFiles.maxAge),
  dotfiles: field.custom<StaticFilesDotfilesMode>().default(ApiKitAppDefaults.staticFiles.dotfiles),
  etag: field.boolean().default(ApiKitAppDefaults.staticFiles.etag),
  immutable: field.boolean().default(ApiKitAppDefaults.staticFiles.immutable),
  decorateReply: field.boolean().default(ApiKitAppDefaults.staticFiles.decorateReply),
  preCompressed: field.boolean().default(ApiKitAppDefaults.staticFiles.preCompressed),
});

export type StaticFilesConfig = InferConfiguration<typeof StaticFilesConfiguration>;
