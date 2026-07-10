import { ApiKitAppDefaults } from '@internal/configuration/app';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const BuildConfiguration = defineConfiguration('apikit.build', {
  outDir: field.string().default(ApiKitAppDefaults.build.outDir),
});

export type BuildConfig = InferConfiguration<typeof BuildConfiguration>;
