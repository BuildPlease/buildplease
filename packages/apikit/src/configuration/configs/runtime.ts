import { ApiKitDefaults } from '@internal/configuration/apikit-defaults';

import { type InferConfiguration, defineConfiguration, field } from '@/configuration/core';

export const ApiKitRuntimeConfiguration = defineConfiguration({
  debug: field.boolean().default(ApiKitDefaults.runtime.debug),
  outDir: field.string().default(ApiKitDefaults.runtime.outDir),
  environmentFileDir: field.string().default(ApiKitDefaults.runtime.environmentFileDir),
});

export type ApiKitRuntimeConfig = InferConfiguration<typeof ApiKitRuntimeConfiguration>;
