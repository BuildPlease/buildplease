import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const BuildConfiguration = defineConfiguration('apikit.build', {
  debug: field.boolean().default(ApiKitDefaults.build.debug),
  outDir: field.string().default(ApiKitDefaults.build.outDir),
  environmentFileDir: field.string().default(ApiKitDefaults.build.environmentFileDir),
});

export type BuildConfig = InferConfiguration<typeof BuildConfiguration>;
