import { type InferConfiguration, defineConfiguration, field } from '@buildplease/core/node';
import { ApiKitDefaults } from '@src-internal/configuration';

export const BuildConfiguration = defineConfiguration('apikit.build', {
  outDir: field.string().default(ApiKitDefaults.build.outDir),
});

export type BuildConfig = InferConfiguration<typeof BuildConfiguration>;
