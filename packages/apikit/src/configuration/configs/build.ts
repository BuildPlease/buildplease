import { ApiKitDefaults } from '@internal/configuration';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const BuildConfiguration = defineConfiguration('apikit.build', {
  outDir: field.string().default(ApiKitDefaults.build.outDir),
});

export type BuildConfig = InferConfiguration<typeof BuildConfiguration>;
