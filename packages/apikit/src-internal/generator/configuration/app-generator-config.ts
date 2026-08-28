import { resolveConfiguration } from '@buildplease/core/node';

import { type ApiKitConfig, BuildConfiguration } from '@/configuration';

import type { GeneratorConfig } from './generator-config';

export interface AppGeneratorConfig extends GeneratorConfig {}

export async function resolveAppGeneratorConfig(config: ApiKitConfig): Promise<AppGeneratorConfig> {
  const build = await resolveConfiguration(BuildConfiguration, config.input.build, {});

  return {
    build: build,
  };
}
